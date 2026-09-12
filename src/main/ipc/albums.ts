import { join } from 'node:path';

import { app, ipcMain } from 'electron';

import { IpcChannel } from '../../../shared/ipc';
import { createAlbum, listAlbums, removeAlbum, renameAlbum } from '../services/album-store';

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
};
