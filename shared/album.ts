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

export type Album = {
  id: string;
  name: string;
  photos: AlbumPhoto[];
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
