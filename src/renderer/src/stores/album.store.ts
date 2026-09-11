import { create } from 'zustand';
import { type Album } from '#/types';

type AlbumState = {
  albums: Album[];
  activeAlbumId: string | null;
  currentPage: number;
};

type AlbumActions = {
  setActiveAlbumId: (albumId: string | null) => void;
  setCurrentPage: (page: number) => void;
  addAlbum: (name?: string) => string;
  renameAlbum: (albumId: string, name: string) => void;
  removeAlbum: (albumId: string) => void;
};

export type AlbumStore = AlbumState & AlbumActions;

const createAlbumId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `album-${Date.now()}`;

export const useAlbumStore = create<AlbumStore>((set, get) => ({
  albums: [],
  activeAlbumId: null,
  currentPage: 1,
  setActiveAlbumId: (activeAlbumId) => set({ activeAlbumId, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage: Math.max(1, currentPage) }),
  addAlbum: (name) => {
    const id = createAlbumId();
    const album: Album = {
      id,
      name: name?.trim() || `Album ${get().albums.length + 1}`,
      photoIds: []
    };
    set((state) => ({
      albums: [...state.albums, album],
      activeAlbumId: id,
      currentPage: 1
    }));
    return id;
  },
  renameAlbum: (albumId, name) =>
    set((state) => ({
      albums: state.albums.map((album) => (album.id === albumId ? { ...album, name } : album))
    })),
  removeAlbum: (albumId) =>
    set((state) => {
      const albums = state.albums.filter((album) => album.id !== albumId);
      const activeAlbumId =
        state.activeAlbumId === albumId ? (albums[0]?.id ?? null) : state.activeAlbumId;
      return {
        albums,
        activeAlbumId,
        currentPage: activeAlbumId === state.activeAlbumId ? state.currentPage : 1
      };
    })
}));
