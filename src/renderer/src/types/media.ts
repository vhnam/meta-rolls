import { type PhotoExif, type PhotoExifField } from '../../../../shared/media';

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
  createdAt: string;
  size: number;
  width: number;
  height: number;
  path?: string;
};

export type { PhotoExif, PhotoExifField };
