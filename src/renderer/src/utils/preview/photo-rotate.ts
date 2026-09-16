import { type PhotoRotateDirection } from '#/types';

export const PHOTO_ROTATE_MS = 240;
export const PHOTO_ROTATE_QUEUE_MAX = 8;

export const photoRotateDegrees = (direction: PhotoRotateDirection) =>
  direction === 'cw' ? 90 : -90;

export const photoRotateFitScale = (image: HTMLElement, viewport: HTMLElement) => {
  const style = getComputedStyle(viewport);
  const availableWidth =
    viewport.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const availableHeight =
    viewport.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  const { offsetWidth, offsetHeight } = image;
  if (offsetWidth === 0 || offsetHeight === 0 || availableWidth <= 0 || availableHeight <= 0) {
    return 1;
  }
  return Math.min(availableWidth / offsetHeight, availableHeight / offsetWidth);
};

export const preloadMediaImage = (src: string) =>
  new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject();
    image.src = src;
  });

export const waitMs = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
