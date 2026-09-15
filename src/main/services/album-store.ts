import { randomUUID } from 'node:crypto';
import { type DatabaseSync } from 'node:sqlite';

import {
  type Album,
  type AlbumPhoto,
  type PhotoRating,
  parseAlbumPhoto
} from '../../../shared/album';
import { getAppDatabase } from './app-database';

type AlbumRow = {
  id: string;
  name: string;
  photos: string;
};

const parseAlbumPhotos = (value: string): AlbumPhoto[] => {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.flatMap((item) => {
      const photo = parseAlbumPhoto(item);
      return photo ? [photo] : [];
    });
  } catch {
    return [];
  }
};

const toAlbum = (row: AlbumRow): Album => ({
  id: row.id,
  name: row.name,
  photos: parseAlbumPhotos(row.photos)
});

const readAlbum = (db: DatabaseSync, albumId: string): Album | null => {
  const row = readRow(db.prepare('SELECT id, name, photos FROM albums WHERE id = ?').get(albumId));
  return row ? toAlbum(row) : null;
};

const writeAlbumPhotos = (db: DatabaseSync, albumId: string, photos: AlbumPhoto[]) => {
  db.prepare('UPDATE albums SET photos = ? WHERE id = ?').run(JSON.stringify(photos), albumId);
};

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
  const album = readAlbum(db, albumId);
  if (!album) {
    return null;
  }

  if (album.photos.some((existing) => existing.id === photo.id)) {
    return album;
  }

  const photos = [...album.photos, photo];
  writeAlbumPhotos(db, albumId, photos);

  return { ...album, photos };
};

export const movePhotoToAlbum = (
  filePath: string,
  fromAlbumId: string,
  toAlbumId: string,
  photoId: string
): { from: Album; to: Album } | null => {
  if (fromAlbumId === toAlbumId) {
    return null;
  }

  const db = getAppDatabase(filePath);
  const fromAlbum = readAlbum(db, fromAlbumId);
  const destinationAlbum = readAlbum(db, toAlbumId);
  if (!fromAlbum || !destinationAlbum) {
    return null;
  }

  const photo = fromAlbum.photos.find((item) => item.id === photoId);
  if (!photo) {
    return null;
  }

  const fromPhotos = fromAlbum.photos.filter((item) => item.id !== photoId);
  const toPhotos = destinationAlbum.photos.some((item) => item.id === photoId)
    ? destinationAlbum.photos
    : [...destinationAlbum.photos, photo];

  db.exec('BEGIN IMMEDIATE');
  try {
    writeAlbumPhotos(db, fromAlbumId, fromPhotos);
    writeAlbumPhotos(db, toAlbumId, toPhotos);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return {
    from: { ...fromAlbum, photos: fromPhotos },
    to: { ...destinationAlbum, photos: toPhotos }
  };
};

export const removePhotoFromAlbum = (
  filePath: string,
  albumId: string,
  photoId: string
): Album | null => {
  const db = getAppDatabase(filePath);
  const album = readAlbum(db, albumId);
  if (!album) {
    return null;
  }

  if (!album.photos.some((item) => item.id === photoId)) {
    return album;
  }

  const photos = album.photos.filter((item) => item.id !== photoId);
  writeAlbumPhotos(db, albumId, photos);

  return { ...album, photos };
};

export const ratePhotoInAlbum = (
  filePath: string,
  albumId: string,
  photoId: string,
  rating: PhotoRating
): Album | null => {
  const db = getAppDatabase(filePath);
  const album = readAlbum(db, albumId);
  if (!album) {
    return null;
  }

  if (!album.photos.some((item) => item.id === photoId)) {
    return album;
  }

  const photos = album.photos.map((item) => (item.id === photoId ? { ...item, rating } : item));
  writeAlbumPhotos(db, albumId, photos);

  return { ...album, photos };
};
