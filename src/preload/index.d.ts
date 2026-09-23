import {
  type Album,
  type AlbumPhoto,
  type AlbumPrintConfig,
  type PhotoRating
} from '../../shared/album';
import { type PhotoExif, type PhotoRotateDirection } from '../../shared/media';
import { type DeliverPdfExportRequest } from '../../shared/print';

export type SettingsStorageApi = {
  getItem: (name: string) => Promise<string | null>;
  setItem: (name: string, value: string) => Promise<void>;
  removeItem: (name: string) => Promise<void>;
};

export type MediaLibraryEntry = {
  id: string;
  name: string;
  path: string;
  hasChildren: boolean;
};

export type MediaFileEntry = {
  id: string;
  name: string;
  path: string;
  createdAt: string;
  mtimeMs: number;
  size: number;
  width: number;
  height: number;
};

export type MediaFolderListing = {
  folders: MediaLibraryEntry[];
  files: MediaFileEntry[];
};

export type MediaLibraryApi = {
  listVolumes: () => Promise<MediaLibraryEntry[]>;
  listFolder: (dirPath: string) => Promise<MediaFolderListing>;
  readExif: (filePath: string) => Promise<PhotoExif | null>;
  rotateImage: (filePath: string, direction: PhotoRotateDirection) => Promise<{ mtimeMs: number }>;
};

export type AlbumsApi = {
  list: () => Promise<Album[]>;
  create: (name?: string) => Promise<Album>;
  rename: (albumId: string, name: string) => Promise<Album | null>;
  remove: (albumId: string) => Promise<void>;
  addPhoto: (albumId: string, photo: AlbumPhoto) => Promise<Album | null>;
  movePhoto: (
    fromAlbumId: string,
    toAlbumId: string,
    photoId: string
  ) => Promise<{ from: Album; to: Album } | null>;
  removePhoto: (albumId: string, photoId: string) => Promise<Album | null>;
  ratePhoto: (albumId: string, photoId: string, rating: PhotoRating) => Promise<Album | null>;
  updatePrintConfig: (albumId: string, printConfig: AlbumPrintConfig) => Promise<Album | null>;
};

export type MenuApi = {
  onOpenPreferences: (callback: () => void) => () => void;
  onTogglePhotoFullscreen: (callback: () => void) => () => void;
  onRotatePhotoCw: (callback: () => void) => () => void;
  onRotatePhotoCcw: (callback: () => void) => () => void;
};

export type WindowApi = {
  setFullScreen: (enabled: boolean) => Promise<void>;
  onLeaveFullScreen: (callback: () => void) => () => void;
};

export type DeliverApi = {
  exportPdf: (request: DeliverPdfExportRequest) => Promise<string | null>;
  openExportedFile: (filePath: string) => Promise<boolean>;
};

export type RendererApi = {
  settings: SettingsStorageApi;
  media: MediaLibraryApi;
  albums: AlbumsApi;
  menu: MenuApi;
  window: WindowApi;
  deliver: DeliverApi;
};

declare global {
  interface Window {
    api: RendererApi;
  }
}
