import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

let cached: { filePath: string; db: DatabaseSync } | null = null;

const migrate = (db: DatabaseSync) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS albums (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      photo_ids TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL
    )
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

  cached = { filePath, db };
  return db;
};

export const closeAppDatabase = () => {
  cached?.db.close();
  cached = null;
};
