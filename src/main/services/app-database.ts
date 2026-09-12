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
      created_at INTEGER NOT NULL
    )
  `);

  const columns = db.prepare('PRAGMA table_info(albums)').all() as { name: string }[];
  const hasLegacyPhotoIds = columns.some((column) => column.name === 'photo_ids');
  const hasPhotos = columns.some((column) => column.name === 'photos');
  if (hasLegacyPhotoIds && !hasPhotos) {
    db.exec('ALTER TABLE albums RENAME COLUMN photo_ids TO photos');
  }
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

  cached = { filePath, db };
  return db;
};

export const closeAppDatabase = () => {
  cached?.db.close();
  cached = null;
};
