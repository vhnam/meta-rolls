import {
  THUMBNAIL_MAX_COLUMNS,
  THUMBNAIL_MIN_COLUMNS,
  THUMBNAIL_STRIP_MAX_WIDTH,
  THUMBNAIL_STRIP_MIN_WIDTH
} from '#/constants/media';

const clampZoom = (zoom: number) => Math.min(100, Math.max(0, zoom));

export const getThumbnailColumnCount = (zoom: number) => {
  const span = THUMBNAIL_MAX_COLUMNS - THUMBNAIL_MIN_COLUMNS;
  return THUMBNAIL_MAX_COLUMNS - Math.round((span * clampZoom(zoom)) / 100);
};

export const getThumbnailStripWidth = (zoom: number) => {
  const span = THUMBNAIL_STRIP_MAX_WIDTH - THUMBNAIL_STRIP_MIN_WIDTH;
  return Math.round(THUMBNAIL_STRIP_MIN_WIDTH + (span * clampZoom(zoom)) / 100);
};
