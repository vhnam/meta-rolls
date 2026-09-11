import { ElectronAPI } from '@electron-toolkit/preload';

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
};

export type RendererApi = {
  settings: SettingsStorageApi;
  media: MediaLibraryApi;
};

declare global {
  interface Window {
    electron: ElectronAPI;
    api: RendererApi;
  }
}
