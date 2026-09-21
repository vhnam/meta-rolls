export type PhotoRating = 0 | 1 | 2 | 3 | 4 | 5;

export const isPhotoRating = (value: unknown): value is PhotoRating =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 5;

export const toPhotoRating = (value: unknown): PhotoRating => (isPhotoRating(value) ? value : 0);

export type AlbumPhoto = {
  id: string;
  name: string;
  path: string;
  size: number;
  width: number;
  height: number;
  createdAt: string;
  rating: PhotoRating;
};

export type AlbumPagePreset = 'instax-mini' | 'instax-wide';

export type AlbumPageSize = 'a4' | 'a5' | 'letter';

export type AlbumPrintConfig = {
  pagePreset: AlbumPagePreset | null;
  pageSize: AlbumPageSize | null;
  showPageNumbers: boolean;
  leftHandFirst: boolean;
};

export const DEFAULT_ALBUM_PRINT_CONFIG: AlbumPrintConfig = {
  pagePreset: null,
  pageSize: null,
  showPageNumbers: false,
  leftHandFirst: false
};

export type Album = {
  id: string;
  name: string;
  photos: AlbumPhoto[];
  pagePreset: AlbumPagePreset | null;
  pageSize: AlbumPageSize | null;
  showPageNumbers: boolean;
  leftHandFirst: boolean;
};

export const parseAlbumPhoto = (value: unknown): AlbumPhoto | null => {
  if (value === null || typeof value !== 'object') {
    return null;
  }
  const photo = value as Record<string, unknown>;
  if (
    typeof photo.id !== 'string' ||
    typeof photo.name !== 'string' ||
    typeof photo.path !== 'string' ||
    typeof photo.size !== 'number' ||
    typeof photo.width !== 'number' ||
    typeof photo.height !== 'number' ||
    typeof photo.createdAt !== 'string'
  ) {
    return null;
  }
  if (photo.rating !== undefined && !isPhotoRating(photo.rating)) {
    return null;
  }
  return {
    id: photo.id,
    name: photo.name,
    path: photo.path,
    size: photo.size,
    width: photo.width,
    height: photo.height,
    createdAt: photo.createdAt,
    rating: toPhotoRating(photo.rating)
  };
};

const isPagePreset = (value: unknown): value is AlbumPagePreset =>
  value === 'instax-mini' || value === 'instax-wide';

const isPageSize = (value: unknown): value is AlbumPageSize =>
  value === 'a4' || value === 'a5' || value === 'letter';

export const parseAlbumPrintConfig = (value: unknown): AlbumPrintConfig | null => {
  if (value === null || typeof value !== 'object') {
    return null;
  }
  const config = value as Record<string, unknown>;
  if (config.pagePreset !== null && !isPagePreset(config.pagePreset)) {
    return null;
  }
  if (config.pageSize !== null && !isPageSize(config.pageSize)) {
    return null;
  }
  if (typeof config.showPageNumbers !== 'boolean') {
    return null;
  }
  if (
    (config.leftHandFirst !== undefined && typeof config.leftHandFirst !== 'boolean') ||
    (config.firstPageIsLeftHand !== undefined && typeof config.firstPageIsLeftHand !== 'boolean')
  ) {
    return null;
  }
  return {
    pagePreset: config.pagePreset,
    pageSize: config.pageSize,
    showPageNumbers: config.showPageNumbers,
    leftHandFirst: config.leftHandFirst === true || config.firstPageIsLeftHand === true
  };
};

export const toAlbumPrintConfig = (value: unknown): AlbumPrintConfig =>
  parseAlbumPrintConfig(value) ?? DEFAULT_ALBUM_PRINT_CONFIG;
