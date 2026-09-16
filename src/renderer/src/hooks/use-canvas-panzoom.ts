import { usePanzoom } from '#/hooks/use-panzoom';
import { PREVIEW_ZOOM_FIT, PREVIEW_ZOOM_OPTIONS } from '#/utils/preview';

const FIT_SCALE_TOLERANCE = 0.02;
const PERCENT_TOLERANCE = 2;

type UseCanvasPanzoomArgs = {
  viewport: HTMLElement | null;
  target: HTMLElement | null;
  enabled: boolean;
};

// The deliver canvas has no intrinsic "natural" resolution the way a photo
// does, so a zoom percentage maps directly to a Panzoom scale (100% == the
// book's authored layout size) instead of a natural-vs-displayed ratio.
const scaleForZoomValue = (value: string): number | null => {
  if (value === PREVIEW_ZOOM_FIT) {
    return null;
  }

  const percent = Number(value);
  return Number.isFinite(percent) ? percent / 100 : null;
};

const zoomValueFromScale = (scale: number): string => {
  if (Math.abs(scale - 1) < FIT_SCALE_TOLERANCE) {
    return PREVIEW_ZOOM_FIT;
  }

  const percent = scale * 100;
  const match = PREVIEW_ZOOM_OPTIONS.find(
    (option) =>
      option.value !== PREVIEW_ZOOM_FIT &&
      Math.abs(Number(option.value) - percent) < PERCENT_TOLERANCE
  );

  return match?.value ?? String(Math.round(percent));
};

export const useCanvasPanzoom = ({ viewport, target, enabled }: UseCanvasPanzoomArgs) =>
  usePanzoom({
    viewport,
    target,
    enabled,
    resetKey: null,
    scaleForZoomValue: (value) => scaleForZoomValue(value),
    zoomValueFromScale: (scale) => zoomValueFromScale(scale)
  });
