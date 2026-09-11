import { ipcMain } from 'electron';
import { IpcChannel } from '../../../shared/ipc';
import { listFolder, listVolumes } from '../services/media-library';

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
};
