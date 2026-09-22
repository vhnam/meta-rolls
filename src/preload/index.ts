import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge, ipcRenderer } from 'electron';

import { type AlbumPhoto, type AlbumPrintConfig, type PhotoRating } from '../../shared/album';
import { IpcChannel } from '../../shared/ipc';
import { type PhotoRotateDirection } from '../../shared/media';
import { type DeliverPdfExportRequest } from '../../shared/print';

const api = {
  settings: {
    getItem: (name: string) => ipcRenderer.invoke(IpcChannel.settingsGet, name),
    setItem: (name: string, value: string) =>
      ipcRenderer.invoke(IpcChannel.settingsSet, name, value),
    removeItem: (name: string) => ipcRenderer.invoke(IpcChannel.settingsRemove, name)
  },
  media: {
    listVolumes: () => ipcRenderer.invoke(IpcChannel.mediaListVolumes),
    listFolder: (dirPath: string) => ipcRenderer.invoke(IpcChannel.mediaListFolder, dirPath),
    readExif: (filePath: string) => ipcRenderer.invoke(IpcChannel.mediaReadExif, filePath),
    rotateImage: (filePath: string, direction: PhotoRotateDirection) =>
      ipcRenderer.invoke(IpcChannel.mediaRotateImage, filePath, direction)
  },
  albums: {
    list: () => ipcRenderer.invoke(IpcChannel.albumsList),
    create: (name?: string) => ipcRenderer.invoke(IpcChannel.albumsCreate, name),
    rename: (albumId: string, name: string) =>
      ipcRenderer.invoke(IpcChannel.albumsRename, albumId, name),
    remove: (albumId: string) => ipcRenderer.invoke(IpcChannel.albumsRemove, albumId),
    addPhoto: (albumId: string, photo: AlbumPhoto) =>
      ipcRenderer.invoke(IpcChannel.albumsAddPhoto, albumId, photo),
    movePhoto: (fromAlbumId: string, toAlbumId: string, photoId: string) =>
      ipcRenderer.invoke(IpcChannel.albumsMovePhoto, fromAlbumId, toAlbumId, photoId),
    removePhoto: (albumId: string, photoId: string) =>
      ipcRenderer.invoke(IpcChannel.albumsRemovePhoto, albumId, photoId),
    ratePhoto: (albumId: string, photoId: string, rating: PhotoRating) =>
      ipcRenderer.invoke(IpcChannel.albumsRatePhoto, albumId, photoId, rating),
    updatePrintConfig: (albumId: string, printConfig: AlbumPrintConfig) =>
      ipcRenderer.invoke(IpcChannel.albumsUpdatePrintConfig, albumId, printConfig)
  },
  menu: {
    onOpenPreferences: (callback: () => void) => {
      const handler = () => callback();
      ipcRenderer.on(IpcChannel.menuOpenPreferences, handler);
      return () => {
        ipcRenderer.removeListener(IpcChannel.menuOpenPreferences, handler);
      };
    },
    onTogglePhotoFullscreen: (callback: () => void) => {
      const handler = () => callback();
      ipcRenderer.on(IpcChannel.menuTogglePhotoFullscreen, handler);
      return () => {
        ipcRenderer.removeListener(IpcChannel.menuTogglePhotoFullscreen, handler);
      };
    },
    onRotatePhotoCw: (callback: () => void) => {
      const handler = () => callback();
      ipcRenderer.on(IpcChannel.menuRotatePhotoCw, handler);
      return () => {
        ipcRenderer.removeListener(IpcChannel.menuRotatePhotoCw, handler);
      };
    },
    onRotatePhotoCcw: (callback: () => void) => {
      const handler = () => callback();
      ipcRenderer.on(IpcChannel.menuRotatePhotoCcw, handler);
      return () => {
        ipcRenderer.removeListener(IpcChannel.menuRotatePhotoCcw, handler);
      };
    }
  },
  window: {
    setFullScreen: (enabled: boolean) =>
      ipcRenderer.invoke(IpcChannel.windowSetFullScreen, enabled),
    onLeaveFullScreen: (callback: () => void) => {
      const handler = () => callback();
      ipcRenderer.on(IpcChannel.windowLeaveFullScreen, handler);
      return () => {
        ipcRenderer.removeListener(IpcChannel.windowLeaveFullScreen, handler);
      };
    }
  },
  deliver: {
    exportPdf: (request: DeliverPdfExportRequest) =>
      ipcRenderer.invoke(IpcChannel.deliverExportPdf, request),
    openExportedFile: (filePath: string) =>
      ipcRenderer.invoke(IpcChannel.deliverOpenExportedFile, filePath)
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
