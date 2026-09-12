export type FolderKind = 'disk' | 'folder';

export type MediaView = 'list' | 'grid';

export type PhotoFolder = {
  id: string;
  name: string;
  path?: string;
  kind?: FolderKind;
  hasChildren?: boolean;
  children?: PhotoFolder[];
};

export type PhotoItem = {
  id: string;
  folderId: string;
  name: string;
  date: string;
  camera: string;
  accent: string;
  path?: string;
};

export type Album = {
  id: string;
  name: string;
  photos: PhotoItem[];
};
