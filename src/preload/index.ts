import { contextBridge, ipcRenderer } from 'electron';

import { type AlbumPhoto, type AlbumPrintConfig, type PhotoRating } from '../../shared/album';
import { IpcChannel } from '../../shared/ipc';
import { type PhotoRotateDirection } from '../../shared/media';
import { type DeliverPdfExportRequest } from '../../shared/print';
import {
  type Camera,
  type DevJob,
  type FilmStock,
  type GearKind,
  type Lens,
  type Roll,
  type RollFrame,
  type RollStatus
} from '../../shared/rolls';

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
  rolls: {
    snapshot: () => ipcRenderer.invoke(IpcChannel.rollsSnapshot),
    saveGear: (
      input:
        | { kind: 'stock'; value: Partial<FilmStock> }
        | { kind: 'camera'; value: Partial<Camera> }
        | { kind: 'lens'; value: Partial<Lens> }
    ) => ipcRenderer.invoke(IpcChannel.rollsSaveGear, input),
    archiveGear: (kind: GearKind, id: string, archived: boolean) =>
      ipcRenderer.invoke(IpcChannel.rollsArchiveGear, kind, id, archived),
    createRoll: (input: {
      stockId: string;
      cameraId?: string | null;
      lensId?: string | null;
      name?: string;
      quantity?: number;
    }) => ipcRenderer.invoke(IpcChannel.rollsCreateRoll, input),
    updateRoll: (rollId: string, patch: Partial<Roll>) =>
      ipcRenderer.invoke(IpcChannel.rollsUpdateRoll, rollId, patch),
    setStatus: (rollId: string, status: RollStatus) =>
      ipcRenderer.invoke(IpcChannel.rollsSetStatus, rollId, status),
    deleteRoll: (rollId: string) => ipcRenderer.invoke(IpcChannel.rollsDeleteRoll, rollId),
    saveDevJob: (input: Partial<DevJob> & { rollId: string }) =>
      ipcRenderer.invoke(IpcChannel.rollsSaveDevJob, input),
    deleteDevJob: (id: string) => ipcRenderer.invoke(IpcChannel.rollsDeleteDevJob, id),
    updateFrames: (frameIds: string[], patch: Partial<RollFrame>) =>
      ipcRenderer.invoke(IpcChannel.rollsUpdateFrame, frameIds, patch),
    addFrame: (rollId: string) => ipcRenderer.invoke(IpcChannel.rollsAddFrame, rollId),
    removeLastFrame: (rollId: string) => ipcRenderer.invoke(IpcChannel.rollsRemoveFrame, rollId)
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
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  Object.assign(window, { api });
}
