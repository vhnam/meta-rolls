import { create } from 'zustand';

import { FOLDER_KIND, MEDIA_VIEW, PHOTO_PANE, THUMBNAIL_ZOOM_STEP } from '#/constants/media';
import { getApi } from '#/hooks/use-ipc';
import { type MediaView, type PhotoFolder, type PhotoItem, type PhotoPane } from '#/types';
import { findFolder } from '#/utils';

type MediaPoolState = {
  photos: PhotoItem[];
  folders: PhotoFolder[];
  query: string;
  view: MediaView;
  zoom: number;
  selectedFolderId: string;
  folderHistory: string[];
  folderHistoryIndex: number;
  selectedLibraryId: string;
  selectedPhotoId: string | null;
  selectedListFolderId: string | null;
  folderTreeCollapsed: boolean;
  photoPane: PhotoPane | null;
};

type MediaPoolActions = {
  setQuery: (query: string) => void;
  setView: (view: MediaView) => void;
  setZoom: (zoom: number) => void;
  setSelectedFolderId: (folderId: string) => void;
  goBack: () => void;
  goForward: () => void;
  setSelectedLibraryId: (libraryId: string) => void;
  setSelectedPhotoId: (photoId: string | null) => void;
  setSelectedListFolderId: (folderId: string | null) => void;
  toggleFolderTree: () => void;
  setPhotoPane: (photoPane: PhotoPane) => void;
  selectRelativePhoto: (offset: number, extraPhotos?: PhotoItem[]) => void;
  loadVolumes: () => Promise<void>;
  refresh: () => Promise<void>;
  loadFolderChildren: (folder: PhotoFolder) => Promise<void>;
};

export type MediaPoolStore = MediaPoolState & MediaPoolActions;

const matchesQuery = (photo: PhotoItem, query: string) => {
  const needle = query.trim().toLowerCase();
  return needle.length === 0 || photo.name.toLowerCase().includes(needle);
};

export const getSelectedFolder = (state: MediaPoolState) =>
  findFolder(state.folders, state.selectedFolderId);

export const getListPhotos = (state: MediaPoolState) =>
  state.photos.filter(
    (photo) => photo.folderId === state.selectedFolderId && matchesQuery(photo, state.query)
  );

export const getGridPhotos = (state: MediaPoolState) => getListPhotos(state);

export const getVisiblePhotos = (state: MediaPoolState) => getListPhotos(state);

export const getActivePhotoId = (state: MediaPoolState, extraPhotos: PhotoItem[] = []) => {
  if (state.selectedListFolderId) {
    return null;
  }

  const listPhotos = getListPhotos(state);
  const gridPhotos = getGridPhotos(state);
  const selectedIsVisible =
    state.selectedPhotoId !== null &&
    (listPhotos.some((photo) => photo.id === state.selectedPhotoId) ||
      gridPhotos.some((photo) => photo.id === state.selectedPhotoId) ||
      extraPhotos.some((photo) => photo.id === state.selectedPhotoId));

  if (selectedIsVisible) {
    return state.selectedPhotoId;
  }

  return listPhotos[0]?.id ?? gridPhotos[0]?.id ?? null;
};

export const getSelectedPhoto = (state: MediaPoolState, extraPhotos: PhotoItem[] = []) => {
  const activePhotoId = getActivePhotoId(state, extraPhotos);
  return (
    getListPhotos(state).find((photo) => photo.id === activePhotoId) ??
    getGridPhotos(state).find((photo) => photo.id === activePhotoId) ??
    extraPhotos.find((photo) => photo.id === activePhotoId) ??
    null
  );
};

export const canGoBack = (state: MediaPoolState) => state.folderHistoryIndex > 0;

export const canGoForward = (state: MediaPoolState) =>
  state.folderHistoryIndex >= 0 && state.folderHistoryIndex < state.folderHistory.length - 1;

const mergeFolderChildren = (
  previous: PhotoFolder[] | undefined,
  next: PhotoFolder[]
): PhotoFolder[] => {
  const previousById = new Map((previous ?? []).map((folder) => [folder.id, folder]));
  return next.map((folder) => {
    const existing = previousById.get(folder.id);
    if (!existing?.children) {
      return folder;
    }
    return { ...folder, children: existing.children };
  });
};

const setChildrenInTree = (
  folders: PhotoFolder[],
  folderId: string,
  children: PhotoFolder[]
): PhotoFolder[] =>
  folders.map((folder) => {
    if (folder.id === folderId) {
      return { ...folder, children: mergeFolderChildren(folder.children, children) };
    }
    if (folder.children) {
      return { ...folder, children: setChildrenInTree(folder.children, folderId, children) };
    }
    return folder;
  });

const toPhotoItems = (folderId: string, files: PhotoItem[]): PhotoItem[] =>
  files.map((file) => ({
    id: file.id,
    folderId,
    name: file.name,
    createdAt: file.createdAt,
    size: file.size,
    width: file.width,
    height: file.height,
    path: file.path
  }));

const replaceFolderPhotos = (photos: PhotoItem[], folderId: string, next: PhotoItem[]) => [
  ...photos.filter((photo) => photo.folderId !== folderId),
  ...next
];

export const useMediaPoolStore = create<MediaPoolStore>((set, get) => ({
  photos: [],
  folders: [],
  query: '',
  view: MEDIA_VIEW.list,
  zoom: THUMBNAIL_ZOOM_STEP,
  selectedFolderId: '',
  folderHistory: [],
  folderHistoryIndex: -1,
  selectedLibraryId: 'all',
  selectedPhotoId: null,
  selectedListFolderId: null,
  folderTreeCollapsed: false,
  photoPane: null,
  setQuery: (query) => set({ query }),
  setView: (view) => set({ view }),
  setZoom: (zoom) => set({ zoom }),
  setSelectedFolderId: (selectedFolderId) =>
    set((state) => {
      if (selectedFolderId === state.selectedFolderId) {
        return state;
      }
      const folderHistory = [
        ...state.folderHistory.slice(0, state.folderHistoryIndex + 1),
        selectedFolderId
      ];
      return {
        selectedFolderId,
        selectedListFolderId: null,
        folderHistory,
        folderHistoryIndex: folderHistory.length - 1
      };
    }),
  goBack: () => {
    const state = get();
    if (state.folderHistoryIndex <= 0) {
      return;
    }
    const folderHistoryIndex = state.folderHistoryIndex - 1;
    const selectedFolderId = state.folderHistory[folderHistoryIndex];
    set({ folderHistoryIndex, selectedFolderId, selectedListFolderId: null });
  },
  goForward: () => {
    const state = get();
    if (state.folderHistoryIndex >= state.folderHistory.length - 1) {
      return;
    }
    const folderHistoryIndex = state.folderHistoryIndex + 1;
    const selectedFolderId = state.folderHistory[folderHistoryIndex];
    set({ folderHistoryIndex, selectedFolderId, selectedListFolderId: null });
  },
  setSelectedLibraryId: (selectedLibraryId) => set({ selectedLibraryId }),
  setSelectedPhotoId: (selectedPhotoId) => set({ selectedPhotoId, selectedListFolderId: null }),
  setSelectedListFolderId: (selectedListFolderId) =>
    set({ selectedListFolderId, selectedPhotoId: null }),
  toggleFolderTree: () => set((state) => ({ folderTreeCollapsed: !state.folderTreeCollapsed })),
  setPhotoPane: (photoPane) => {
    if (get().photoPane === photoPane) {
      return;
    }
    set({ photoPane });
  },
  selectRelativePhoto: (offset, extraPhotos = []) => {
    const state = get();
    if (!state.photoPane) {
      return;
    }
    const photos = state.photoPane === PHOTO_PANE.albums ? extraPhotos : getVisiblePhotos(state);
    if (photos.length === 0) {
      return;
    }
    const activeId =
      state.photoPane === PHOTO_PANE.albums
        ? extraPhotos.some((photo) => photo.id === state.selectedPhotoId)
          ? state.selectedPhotoId
          : null
        : getActivePhotoId(state);
    if (!activeId) {
      return;
    }
    const currentIndex = photos.findIndex((photo) => photo.id === activeId);
    if (currentIndex === -1) {
      return;
    }
    const nextIndex = (((currentIndex + offset) % photos.length) + photos.length) % photos.length;
    set({ selectedPhotoId: photos[nextIndex].id, selectedListFolderId: null });
  },
  loadVolumes: async () => {
    const volumes = await getApi().media.listVolumes();
    const folders: PhotoFolder[] = volumes.map((volume) => ({
      id: volume.id,
      name: volume.name,
      path: volume.path,
      kind: FOLDER_KIND.disk,
      hasChildren: volume.hasChildren
    }));
    const previousFolderId = get().selectedFolderId;
    set((state) => {
      const matchingVolume = folders.find(
        (folder) =>
          state.selectedFolderId === folder.id || state.selectedFolderId.startsWith(`${folder.id}/`)
      );
      const selectedFolderId = matchingVolume?.id ?? folders[0]?.id ?? '';
      return {
        folders,
        selectedFolderId,
        selectedListFolderId: null,
        folderHistory: selectedFolderId ? [selectedFolderId] : [],
        folderHistoryIndex: selectedFolderId ? 0 : -1
      };
    });
    const selectedFolderId = get().selectedFolderId;
    if (selectedFolderId && selectedFolderId === previousFolderId) {
      const folder = findFolder(get().folders, selectedFolderId);
      if (folder) {
        void get().loadFolderChildren(folder);
      }
    }
  },
  refresh: async () => {
    await get().loadVolumes();
  },
  loadFolderChildren: async (folder) => {
    if (!folder.path) {
      return;
    }
    const listing = await getApi().media.listFolder(folder.path);
    const children: PhotoFolder[] = listing.folders.map((entry) => ({
      id: entry.id,
      name: entry.name,
      path: entry.path,
      kind: FOLDER_KIND.folder,
      hasChildren: entry.hasChildren
    }));
    const photos = toPhotoItems(folder.id, listing.files as PhotoItem[]);
    set((state) => ({
      folders: setChildrenInTree(state.folders, folder.id, children),
      photos: replaceFolderPhotos(state.photos, folder.id, photos)
    }));
  }
}));
