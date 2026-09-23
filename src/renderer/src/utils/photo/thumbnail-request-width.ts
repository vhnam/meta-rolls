import { THUMBNAIL_REQUEST_WIDTH_PX } from '#/constants/media';

// The pixel width to request from the meta-rolls-media:// protocol for a
// grid/strip thumbnail — the CSS baseline scaled by the display's device
// pixel ratio, so retina displays still get a sharp image.
export const getThumbnailRequestWidth = () =>
  Math.round(THUMBNAIL_REQUEST_WIDTH_PX * (window.devicePixelRatio || 1));
