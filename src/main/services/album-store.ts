import { randomUUID } from 'node:crypto';

import { type Album, type AlbumPhoto } from '../../../shared/album';
import { getAppDatabase } from './app-database';

type AlbumRow = {
  id: string;
  name: string;
  photos: string;
};

const isAlbumPhoto = (value: unknown): value is AlbumPhoto => {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const photo = value as Record<string, unknown>;
  return (
    typeof photo.id === 'string' &&
    typeof photo.name === 'string' &&
    typeof photo.path === 'string' &&
    typeof photo.size === 'number' &&
    typeof photo.width === 'number' &&
    typeof photo.height === 'number' &&
    typeof photo.createdAt === 'string'
  );
};

const parseAlbumPhotos = (value: string): AlbumPhoto[] => {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isAlbumPhoto);
  } catch {
    return [];
  }
};

const toAlbum = (row: AlbumRow): Album => ({
  id: row.id,
  name: row.name,
  photos: parseAlbumPhotos(row.photos)
});

const readRow = (value: unknown): AlbumRow | null => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== 'string' ||
    typeof row.name !== 'string' ||
    typeof row.photos !== 'string'
  ) {
    return null;
  }
  return { id: row.id, name: row.name, photos: row.photos };
};

export const listAlbums = (filePath: string): Album[] => {
  const rows = getAppDatabase(filePath)
    .prepare('SELECT id, name, photos FROM albums ORDER BY created_at ASC, name COLLATE NOCASE ASC')
    .all();

  return rows.flatMap((row) => {
    const parsed = readRow(row);
    return parsed ? [toAlbum(parsed)] : [];
  });
};

export const createAlbum = (filePath: string, name?: string): Album => {
  const db = getAppDatabase(filePath);
  const trimmed = name?.trim() ?? '';
  const countRow = db.prepare('SELECT COUNT(*) AS count FROM albums').get();
  const count =
    countRow !== null &&
    typeof countRow === 'object' &&
    'count' in countRow &&
    (typeof countRow.count === 'number' || typeof countRow.count === 'bigint')
      ? Number(countRow.count)
      : 0;
  const album: Album = {
    id: randomUUID(),
    name: trimmed || `Album ${count + 1}`,
    photos: []
  };

  db.prepare('INSERT INTO albums (id, name, photos, created_at) VALUES (?, ?, ?, ?)').run(
    album.id,
    album.name,
    JSON.stringify(album.photos),
    Date.now()
  );

  return album;
};

export const renameAlbum = (filePath: string, albumId: string, name: string): Album | null => {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new Error('Album name must be a non-empty string');
  }

  const db = getAppDatabase(filePath);
  db.prepare('UPDATE albums SET name = ? WHERE id = ?').run(trimmed, albumId);
  const row = readRow(db.prepare('SELECT id, name, photos FROM albums WHERE id = ?').get(albumId));
  return row ? toAlbum(row) : null;
};

export const removeAlbum = (filePath: string, albumId: string): void => {
  getAppDatabase(filePath).prepare('DELETE FROM albums WHERE id = ?').run(albumId);
};

export const addPhotoToAlbum = (
  filePath: string,
  albumId: string,
  photo: AlbumPhoto
): Album | null => {
  const db = getAppDatabase(filePath);
  const row = readRow(db.prepare('SELECT id, name, photos FROM albums WHERE id = ?').get(albumId));
  if (!row) {
    return null;
  }

  const album = toAlbum(row);
  if (album.photos.some((existing) => existing.id === photo.id)) {
    return album;
  }

  const photos = [...album.photos, photo];
  db.prepare('UPDATE albums SET photos = ? WHERE id = ?').run(JSON.stringify(photos), albumId);

  return { ...album, photos };
};
