import {
  type PhotoExif,
  type PhotoExifField,
  type PhotoRotateDirection
} from '#/shared/media';

export type FolderKind = 'disk' | 'folder';

export type MediaView = 'list' | 'thumbnail';

export type PhotoPane = 'browser' | 'albums';

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

export type { PhotoExif, PhotoExifField, PhotoRotateDirection };
