import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

let cached: { filePath: string; db: DatabaseSync } | null = null;

const migrate = (db: DatabaseSync) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS albums (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      photos TEXT NOT NULL DEFAULT '[]',
      print_config TEXT NOT NULL DEFAULT '{"pagePreset":null,"pageSize":null,"showPageNumbers":false}',
      created_at INTEGER NOT NULL
    )
  `);

  let columns = db.prepare('PRAGMA table_info(albums)').all() as { name: string }[];
  const hasLegacyPhotoIds = columns.some((column) => column.name === 'photo_ids');
  const hasPhotos = columns.some((column) => column.name === 'photos');
  if (hasLegacyPhotoIds && !hasPhotos) {
    db.exec('ALTER TABLE albums RENAME COLUMN photo_ids TO photos');
    columns = db.prepare('PRAGMA table_info(albums)').all() as { name: string }[];
  }

  const hasPrintConfig = columns.some((column) => column.name === 'print_config');
  if (!hasPrintConfig) {
    db.exec(
      `ALTER TABLE albums ADD COLUMN print_config TEXT NOT NULL DEFAULT '{"pagePreset":null,"pageSize":null,"showPageNumbers":false}'`
    );
  }
};

const migrateRolls = (db: DatabaseSync) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS film_stocks (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      name TEXT NOT NULL,
      iso INTEGER NOT NULL,
      format TEXT NOT NULL,
      exposures INTEGER NOT NULL,
      process TEXT NOT NULL,
      type TEXT NOT NULL,
      archived INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS cameras (
      id TEXT PRIMARY KEY,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      format TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      archived INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS lenses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      focal_length TEXT NOT NULL DEFAULT '',
      max_aperture TEXT NOT NULL DEFAULT '',
      mount TEXT NOT NULL DEFAULT '',
      archived INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS rolls (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      stock_id TEXT NOT NULL REFERENCES film_stocks(id),
      camera_id TEXT REFERENCES cameras(id),
      lens_id TEXT REFERENCES lenses(id),
      exposures INTEGER NOT NULL,
      shot_iso INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'unused',
      loaded_at TEXT,
      finished_at TEXT,
      expiry_at TEXT,
      notes TEXT NOT NULL DEFAULT '',
      scan_folder TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS dev_jobs (
      id TEXT PRIMARY KEY,
      roll_id TEXT NOT NULL REFERENCES rolls(id) ON DELETE CASCADE,
      lab TEXT NOT NULL DEFAULT '',
      price REAL,
      currency TEXT NOT NULL,
      sent_at TEXT,
      received_at TEXT,
      process TEXT NOT NULL,
      scan_resolution TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS roll_frames (
      id TEXT PRIMARY KEY,
      roll_id TEXT NOT NULL REFERENCES rolls(id) ON DELETE CASCADE,
      number INTEGER NOT NULL,
      aperture TEXT NOT NULL DEFAULT '',
      shutter TEXT NOT NULL DEFAULT '',
      lens_id TEXT REFERENCES lenses(id),
      shot_at TEXT,
      location TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      blank INTEGER NOT NULL DEFAULT 0,
      scan_path TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_dev_jobs_roll ON dev_jobs(roll_id);
    CREATE INDEX IF NOT EXISTS idx_roll_frames_roll ON roll_frames(roll_id, number);
  `);
};

export const getAppDatabase = (filePath: string): DatabaseSync => {
  if (cached?.filePath === filePath) {
    return cached.db;
  }

  cached?.db.close();
  mkdirSync(dirname(filePath), { recursive: true });

  const db = new DatabaseSync(filePath);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  migrate(db);
  migrateRolls(db);

  cached = { filePath, db };
  return db;
};

export const closeAppDatabase = () => {
  cached?.db.close();
  cached = null;
};
