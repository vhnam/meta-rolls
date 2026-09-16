import { join } from 'node:path';

import { app, ipcMain } from 'electron';

import { IpcChannel } from '../../../shared/ipc';
import { isPhotoRotateDirection } from '../../../shared/media';
import { forgetMediaDisplay } from '../app/media-protocol';
import { swapPhotoDimensionsByPath } from '../services/album-store';
import { readPhotoExif, rotateImage } from '../services/exif-reader';
import { listFolder, listVolumes } from '../services/media-library';

const albumsFilePath = () => join(app.getPath('userData'), 'meta-rolls.sqlite');

const assertPath = (value: unknown): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('Folder path must be a non-empty string');
  }
  return value;
};

export const registerMediaIpc = () => {
  ipcMain.handle(IpcChannel.mediaListVolumes, async () => listVolumes());

  ipcMain.handle(IpcChannel.mediaListFolder, async (_event, dirPath: unknown) =>
    listFolder(assertPath(dirPath))
  );

  ipcMain.handle(IpcChannel.mediaReadExif, async (_event, filePath: unknown) =>
    readPhotoExif(assertPath(filePath))
  );

  ipcMain.handle(
    IpcChannel.mediaRotateImage,
    async (_event, filePath: unknown, direction: unknown) => {
      if (!isPhotoRotateDirection(direction)) {
        throw new Error('Rotate direction must be cw or ccw');
      }
      const path = assertPath(filePath);
      const result = await rotateImage(path, direction);
      forgetMediaDisplay(path);
      swapPhotoDimensionsByPath(albumsFilePath(), path);
      return result;
    }
  );
};
