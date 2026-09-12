import { join } from 'node:path';

import { app, ipcMain } from 'electron';

import { IpcChannel } from '../../../shared/ipc';
import { getConfigItem, removeConfigItem, setConfigItem } from '../services/config-store';

const configFilePath = () => join(app.getPath('userData'), 'config.json');

const assertName = (name: unknown): string => {
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error('Settings key must be a non-empty string');
  }
  return name;
};

export const registerSettingsIpc = () => {
  ipcMain.handle(IpcChannel.settingsGet, async (_event, name: unknown) =>
    getConfigItem(configFilePath(), assertName(name))
  );

  ipcMain.handle(IpcChannel.settingsSet, async (_event, name: unknown, value: unknown) => {
    if (typeof value !== 'string') {
      throw new Error('Settings value must be a string');
    }
    await setConfigItem(configFilePath(), assertName(name), value);
  });

  ipcMain.handle(IpcChannel.settingsRemove, async (_event, name: unknown) => {
    await removeConfigItem(configFilePath(), assertName(name));
  });
};
