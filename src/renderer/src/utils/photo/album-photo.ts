import { type AlbumPhoto, type PhotoItem } from '#/types';

export const toPhotoItem = (photo: AlbumPhoto): PhotoItem => ({
  id: photo.id,
  folderId: '',
  name: photo.name,
  createdAt: photo.createdAt,
  size: photo.size,
  width: photo.width,
  height: photo.height,
  path: photo.path
});
