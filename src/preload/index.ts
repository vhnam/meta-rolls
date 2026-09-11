import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { IpcChannel } from '../../shared/ipc';

const api = {
  settings: {
    getItem: (name: string) => ipcRenderer.invoke(IpcChannel.settingsGet, name),
    setItem: (name: string, value: string) =>
      ipcRenderer.invoke(IpcChannel.settingsSet, name, value),
    removeItem: (name: string) => ipcRenderer.invoke(IpcChannel.settingsRemove, name)
  },
  media: {
    listVolumes: () => ipcRenderer.invoke(IpcChannel.mediaListVolumes),
    listFolder: (dirPath: string) => ipcRenderer.invoke(IpcChannel.mediaListFolder, dirPath)
  }
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  Object.assign(window, { electron: electronAPI, api });
}
