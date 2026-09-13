import { create } from 'zustand';

import { MEDIA_VIEW, THUMBNAIL_ZOOM_STEP } from '#/constants/media';
import { getApi } from '#/hooks/use-ipc';
import { type Album, type AlbumPhoto, type MediaView } from '#/types';

type AlbumState = {
  albums: Album[];
  activeAlbumId: string | null;
  currentPage: number;
  view: MediaView;
  zoom: number;
  albumListCollapsed: boolean;
};

type AlbumActions = {
  setActiveAlbumId: (albumId: string | null) => void;
  setCurrentPage: (page: number) => void;
  setView: (view: MediaView) => void;
  setZoom: (zoom: number) => void;
  toggleAlbumList: () => void;
  loadAlbums: () => Promise<void>;
  addAlbum: (name?: string) => Promise<string>;
  renameAlbum: (albumId: string, name: string) => Promise<void>;
  removeAlbum: (albumId: string) => Promise<void>;
  addPhotoToAlbum: (albumId: string, photo: AlbumPhoto) => Promise<void>;
  movePhotoToAlbum: (fromAlbumId: string, toAlbumId: string, photoId: string) => Promise<void>;
  removePhotoFromAlbum: (albumId: string, photoId: string) => Promise<void>;
};

export type AlbumStore = AlbumState & AlbumActions;

const nextActiveAlbumId = (albums: Album[], currentId: string | null) => {
  if (currentId && albums.some((album) => album.id === currentId)) {
    return currentId;
  }
  return albums[0]?.id ?? null;
};

export const useAlbumStore = create<AlbumStore>((set, get) => ({
  albums: [],
  activeAlbumId: null,
  currentPage: 1,
  view: MEDIA_VIEW.thumbnail,
  zoom: THUMBNAIL_ZOOM_STEP,
  albumListCollapsed: false,
  setActiveAlbumId: (activeAlbumId) => set({ activeAlbumId, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage: Math.max(1, currentPage) }),
  setView: (view) => set({ view }),
  setZoom: (zoom) => set({ zoom }),
  toggleAlbumList: () => set((state) => ({ albumListCollapsed: !state.albumListCollapsed })),
  loadAlbums: async () => {
    const albums = await getApi().albums.list();
    const activeAlbumId = nextActiveAlbumId(albums, get().activeAlbumId);
    set({
      albums,
      activeAlbumId,
      currentPage: activeAlbumId === get().activeAlbumId ? get().currentPage : 1
    });
  },
  addAlbum: async (name) => {
    const album = await getApi().albums.create(name);
    set((state) => ({
      albums: [...state.albums, album],
      activeAlbumId: album.id,
      currentPage: 1
    }));
    return album.id;
  },
  renameAlbum: async (albumId, name) => {
    const album = await getApi().albums.rename(albumId, name);
    if (!album) {
      return;
    }
    set((state) => ({
      albums: state.albums.map((item) => (item.id === albumId ? album : item))
    }));
  },
  removeAlbum: async (albumId) => {
    await getApi().albums.remove(albumId);
    set((state) => {
      const albums = state.albums.filter((album) => album.id !== albumId);
      const activeAlbumId = nextActiveAlbumId(albums, state.activeAlbumId);
      return {
        albums,
        activeAlbumId,
        currentPage: activeAlbumId === state.activeAlbumId ? state.currentPage : 1
      };
    });
  },
  addPhotoToAlbum: async (albumId, photo) => {
    const album = await getApi().albums.addPhoto(albumId, photo);
    if (!album) {
      return;
    }
    set((state) => ({
      albums: state.albums.map((item) => (item.id === albumId ? album : item))
    }));
  },
  movePhotoToAlbum: async (fromAlbumId, toAlbumId, photoId) => {
    const result = await getApi().albums.movePhoto(fromAlbumId, toAlbumId, photoId);
    if (!result) {
      return;
    }
    set((state) => ({
      albums: state.albums.map((item) => {
        if (item.id === result.from.id) {
          return result.from;
        }
        if (item.id === result.to.id) {
          return result.to;
        }
        return item;
      })
    }));
  },
  removePhotoFromAlbum: async (albumId, photoId) => {
    const album = await getApi().albums.removePhoto(albumId, photoId);
    if (!album) {
      return;
    }
    set((state) => ({
      albums: state.albums.map((item) => (item.id === albumId ? album : item))
    }));
  }
}));

export const hydrateAlbumStore = async () => {
  try {
    await useAlbumStore.getState().loadAlbums();
  } catch (error) {
    console.error('Failed to load albums from main process', error);
  }
};
