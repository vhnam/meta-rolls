import { GRID_THUMB_ASPECT, GRID_THUMB_BASE, GRID_THUMB_ZOOM_FACTOR } from '#/constants/media';

export const getGridThumbnailSize = (zoom: number) => {
  const width = GRID_THUMB_BASE + zoom * GRID_THUMB_ZOOM_FACTOR;
  return { width, height: width * GRID_THUMB_ASPECT };
};
