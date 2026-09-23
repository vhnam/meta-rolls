import { usePanzoom } from '#/hooks/use-panzoom';
import { panzoomScaleForPreviewZoom, previewZoomFromPanzoomScale } from '#/utils/preview';

type UseMediaPanzoomArgs = {
  viewport: HTMLElement | null;
  target: HTMLImageElement | null;
  enabled: boolean;
  resetKey: string | null;
};

export const useMediaPanzoom = ({ viewport, target, enabled, resetKey }: UseMediaPanzoomArgs) =>
  usePanzoom({
    viewport,
    target,
    enabled,
    resetKey,
    scaleForZoomValue: (value, element) =>
      panzoomScaleForPreviewZoom(value, element as HTMLImageElement),
    zoomValueFromScale: (scale, element) =>
      previewZoomFromPanzoomScale(scale, element as HTMLImageElement)
  });
