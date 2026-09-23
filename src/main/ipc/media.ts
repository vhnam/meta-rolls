import { join } from 'node:path';

import { app, ipcMain } from 'electron';

import { IpcChannel } from '../../../shared/ipc';
import { isPhotoRotateDirection } from '../../../shared/media';
import { forgetMediaDisplay } from '../app/media-protocol';
import { swapPhotoDimensionsByPath } from '../services/album-store';
import { readPhotoExif, rotateImage } from '../services/exif-reader';
import { isImageFile, listFolder, listVolumes } from '../services/media-library';

const albumsFilePath = () => join(app.getPath('userData'), 'meta-rolls.sqlite');

const assertPath = (value: unknown): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('Folder path must be a non-empty string');
  }
  return value;
};

// mediaReadExif and mediaRotateImage run exiftool reads/writes against
// whatever path the renderer sends — scope both to files this app would
// have shown as photos, so a compromised renderer can't use them to read
// or (via rotate) mutate arbitrary files on disk.
const assertImagePath = (value: unknown): string => {
  const path = assertPath(value);
  if (!isImageFile(path)) {
    throw new Error('Path is not a recognized image file');
  }
  return path;
};

export const registerMediaIpc = () => {
  ipcMain.handle(IpcChannel.mediaListVolumes, async () => listVolumes());

  ipcMain.handle(IpcChannel.mediaListFolder, async (_event, dirPath: unknown) =>
    listFolder(assertPath(dirPath))
  );

  ipcMain.handle(IpcChannel.mediaReadExif, async (_event, filePath: unknown) =>
    readPhotoExif(assertImagePath(filePath))
  );

  ipcMain.handle(
    IpcChannel.mediaRotateImage,
    async (_event, filePath: unknown, direction: unknown) => {
      if (!isPhotoRotateDirection(direction)) {
        throw new Error('Rotate direction must be cw or ccw');
      }
      const path = assertImagePath(filePath);
      const result = await rotateImage(path, direction);
      forgetMediaDisplay(path);
      swapPhotoDimensionsByPath(albumsFilePath(), path);
      return result;
    }
  );
};
