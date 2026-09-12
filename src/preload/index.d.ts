import { ElectronAPI } from '@electron-toolkit/preload';

import { type Album } from '../../shared/album';
import { type PhotoExif } from '../../shared/media';

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
  date: string;
};

export type MediaFolderListing = {
  folders: MediaLibraryEntry[];
  files: MediaFileEntry[];
};

export type MediaLibraryApi = {
  listVolumes: () => Promise<MediaLibraryEntry[]>;
  listFolder: (dirPath: string) => Promise<MediaFolderListing>;
  readExif: (filePath: string) => Promise<PhotoExif | null>;
};

export type AlbumsApi = {
  list: () => Promise<Album[]>;
  create: (name?: string) => Promise<Album>;
  rename: (albumId: string, name: string) => Promise<Album | null>;
  remove: (albumId: string) => Promise<void>;
};

export type MenuApi = {
  onOpenPreferences: (callback: () => void) => () => void;
};

export type RendererApi = {
  settings: SettingsStorageApi;
  media: MediaLibraryApi;
  albums: AlbumsApi;
  menu: MenuApi;
};

declare global {
  interface Window {
    electron: ElectronAPI;
    api: RendererApi;
  }
}
