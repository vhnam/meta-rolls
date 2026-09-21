import { join } from 'node:path';

import { app, ipcMain } from 'electron';

import { isPhotoRating, parseAlbumPhoto, parseAlbumPrintConfig } from '../../../shared/album';
import { IpcChannel } from '../../../shared/ipc';
import {
  addPhotoToAlbum,
  createAlbum,
  listAlbums,
  movePhotoToAlbum,
  ratePhotoInAlbum,
  removeAlbum,
  removePhotoFromAlbum,
  renameAlbum,
  updateAlbumPrintConfig
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

const assertAlbumPhoto = (value: unknown) => {
  const photo = parseAlbumPhoto(value);
  if (!photo) {
    throw new Error('Album photo is missing required fields');
  }
  return photo;
};

const assertPhotoRating = (value: unknown) => {
  if (!isPhotoRating(value)) {
    throw new Error('Photo rating must be an integer from 0 to 5');
  }
  return value;
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

  ipcMain.handle(
    IpcChannel.albumsRatePhoto,
    (_event, albumId: unknown, photoId: unknown, rating: unknown) =>
      ratePhotoInAlbum(
        albumsFilePath(),
        assertId(albumId),
        assertId(photoId),
        assertPhotoRating(rating)
      )
  );

  ipcMain.handle(
    IpcChannel.albumsUpdatePrintConfig,
    (_event, albumId: unknown, printConfig: unknown) => {
      const parsed = parseAlbumPrintConfig(printConfig);
      if (!parsed) {
        throw new Error('Album print config is invalid');
      }
      return updateAlbumPrintConfig(albumsFilePath(), assertId(albumId), parsed);
    }
  );
};
