import { THUMBNAIL_MAX_COLUMNS, THUMBNAIL_MIN_COLUMNS } from '#/constants/media';

export const getThumbnailColumnCount = (zoom: number) => {
  const clamped = Math.min(100, Math.max(0, zoom));
  const span = THUMBNAIL_MAX_COLUMNS - THUMBNAIL_MIN_COLUMNS;
  return THUMBNAIL_MAX_COLUMNS - Math.round((span * clamped) / 100);
};
