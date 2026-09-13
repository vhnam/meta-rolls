import { join } from 'node:path';

import { app, ipcMain } from 'electron';

import { type AlbumPhoto } from '../../../shared/album';
import { IpcChannel } from '../../../shared/ipc';
import {
  addPhotoToAlbum,
  createAlbum,
  listAlbums,
  movePhotoToAlbum,
  removeAlbum,
  removePhotoFromAlbum,
  renameAlbum
} from '../services/album-store';

const albumsFilePath = () => join(app.getPath('userData'), 'meta-rolls.sqlite');

const assertId = (value: unknown): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('Album id must be a non-empty string');
  }
  return value;
};

const assertOptionalName = (value: unknown): string | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new Error('Album name must be a string');
  }
  return value;
};

const assertAlbumPhoto = (value: unknown): AlbumPhoto => {
  if (value === null || typeof value !== 'object') {
    throw new Error('Album photo must be an object');
  }
  const photo = value as Record<string, unknown>;
  if (
    typeof photo.id !== 'string' ||
    typeof photo.name !== 'string' ||
    typeof photo.path !== 'string' ||
    typeof photo.size !== 'number' ||
    typeof photo.width !== 'number' ||
    typeof photo.height !== 'number' ||
    typeof photo.createdAt !== 'string'
  ) {
    throw new Error('Album photo is missing required fields');
  }
  return {
    id: photo.id,
    name: photo.name,
    path: photo.path,
    size: photo.size,
    width: photo.width,
    height: photo.height,
    createdAt: photo.createdAt
  };
};

export const registerAlbumsIpc = () => {
  ipcMain.handle(IpcChannel.albumsList, () => listAlbums(albumsFilePath()));

  ipcMain.handle(IpcChannel.albumsCreate, (_event, name: unknown) =>
    createAlbum(albumsFilePath(), assertOptionalName(name))
  );

  ipcMain.handle(IpcChannel.albumsRename, (_event, albumId: unknown, name: unknown) => {
    if (typeof name !== 'string') {
      throw new Error('Album name must be a string');
    }
    return renameAlbum(albumsFilePath(), assertId(albumId), name);
  });

  ipcMain.handle(IpcChannel.albumsRemove, (_event, albumId: unknown) =>
    removeAlbum(albumsFilePath(), assertId(albumId))
  );

  ipcMain.handle(IpcChannel.albumsAddPhoto, (_event, albumId: unknown, photo: unknown) =>
    addPhotoToAlbum(albumsFilePath(), assertId(albumId), assertAlbumPhoto(photo))
  );

  ipcMain.handle(
    IpcChannel.albumsMovePhoto,
    (_event, fromAlbumId: unknown, toAlbumId: unknown, photoId: unknown) =>
      movePhotoToAlbum(
        albumsFilePath(),
        assertId(fromAlbumId),
        assertId(toAlbumId),
        assertId(photoId)
      )
  );

  ipcMain.handle(IpcChannel.albumsRemovePhoto, (_event, albumId: unknown, photoId: unknown) =>
    removePhotoFromAlbum(albumsFilePath(), assertId(albumId), assertId(photoId))
  );
};
