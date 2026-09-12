import Panzoom, { type PanzoomObject } from '@panzoom/panzoom';
import { useEffect, useRef, useState } from 'react';

import {
  panzoomScaleForPreviewZoom,
  PREVIEW_ZOOM_FIT,
  previewZoomFromPanzoomScale
} from '#/utils/preview-zoom';

const MAX_SCALE = 64;
const MIN_SCALE = 0.125;
const ZOOM_ANIMATION_MS = 240;
const WHEEL_STEP = 0.3;

type UseMediaPanzoomArgs = {
  viewport: HTMLElement | null;
  target: HTMLImageElement | null;
  enabled: boolean;
  resetKey: string | null;
};

type PanPoint = {
  x: number;
  y: number;
};

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

const clampScale = (scale: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));

const wheelDirection = (event: WheelEvent) =>
  (event.deltaY === 0 && event.deltaX ? event.deltaX : event.deltaY) < 0 ? 1 : -1;

export const useMediaPanzoom = ({ viewport, target, enabled, resetKey }: UseMediaPanzoomArgs) => {
  const panzoomRef = useRef<PanzoomObject | null>(null);
  const easeToRef = useRef<((scale: number, pan: PanPoint) => void) | null>(null);
  const [zoomValue, setZoomValue] = useState<string | null>(PREVIEW_ZOOM_FIT);
  const [zoomKey, setZoomKey] = useState(resetKey);

  if (zoomKey !== resetKey) {
    setZoomKey(resetKey);
    setZoomValue(PREVIEW_ZOOM_FIT);
  }

  useEffect(() => {
    if (!enabled || !viewport || !target) {
      panzoomRef.current = null;
      easeToRef.current = null;
      return;
    }

    const panzoom = Panzoom(target, {
      animate: false,
      canvas: true,
      cursor: 'grab',
      duration: ZOOM_ANIMATION_MS,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      maxScale: MAX_SCALE,
      minScale: MIN_SCALE,
      pinchAndPan: true,
      step: WHEEL_STEP
    });
    panzoomRef.current = panzoom;

    let easeRaf = 0;
    let wheelRaf = 0;
    let panX = 0;
    let panY = 0;
    let pinchSteps = 0;
    let pinchPoint: { clientX: number; clientY: number } | null = null;

    const cancelEase = () => {
      if (easeRaf) {
        cancelAnimationFrame(easeRaf);
        easeRaf = 0;
      }
    };

    const easeTo = (toScale: number, toPan: PanPoint) => {
      cancelEase();
      const fromScale = panzoom.getScale();
      const fromPan = panzoom.getPan();
      const start = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / ZOOM_ANIMATION_MS);
        const k = easeOutCubic(t);
        panzoom.zoom(fromScale + (toScale - fromScale) * k, { animate: false });
        panzoom.pan(fromPan.x + (toPan.x - fromPan.x) * k, fromPan.y + (toPan.y - fromPan.y) * k, {
          animate: false,
          force: true
        });
        if (t < 1) {
          easeRaf = requestAnimationFrame(tick);
          return;
        }
        easeRaf = 0;
      };

      easeRaf = requestAnimationFrame(tick);
    };
    easeToRef.current = easeTo;

    const flushWheel = () => {
      wheelRaf = 0;
      if (pinchPoint && pinchSteps !== 0) {
        const nextScale = clampScale(panzoom.getScale() * Math.exp((pinchSteps * WHEEL_STEP) / 3));
        panzoom.zoomToPoint(nextScale, pinchPoint, { animate: false });
      } else if (panX !== 0 || panY !== 0) {
        const scale = panzoom.getScale();
        panzoom.pan(-panX / scale, -panY / scale, { animate: false, relative: true });
      }
      panX = 0;
      panY = 0;
      pinchSteps = 0;
      pinchPoint = null;
    };

    const syncZoomValue = () => {
      setZoomValue(previewZoomFromPanzoomScale(panzoom.getScale(), target));
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      cancelEase();
      if (event.ctrlKey) {
        pinchSteps += wheelDirection(event);
        pinchPoint = { clientX: event.clientX, clientY: event.clientY };
      } else {
        panX += event.deltaX;
        panY += event.deltaY;
      }
      if (!wheelRaf) {
        wheelRaf = requestAnimationFrame(flushWheel);
      }
    };
    const onDblClick = () => {
      easeTo(1, { x: 0, y: 0 });
    };

    viewport.addEventListener('wheel', onWheel, { passive: false });
    target.addEventListener('dblclick', onDblClick);
    target.addEventListener('panzoomchange', syncZoomValue);

    return () => {
      cancelEase();
      if (wheelRaf) {
        cancelAnimationFrame(wheelRaf);
      }
      viewport.removeEventListener('wheel', onWheel);
      target.removeEventListener('dblclick', onDblClick);
      target.removeEventListener('panzoomchange', syncZoomValue);
      panzoom.destroy();
      panzoomRef.current = null;
      easeToRef.current = null;
    };
  }, [enabled, target, viewport]);

  const applyZoom = (value: string | null) => {
    const panzoom = panzoomRef.current;
    const easeTo = easeToRef.current;
    if (!value || !panzoom || !target || !easeTo) {
      return;
    }

    const scale = panzoomScaleForPreviewZoom(value, target);
    if (scale === null) {
      easeTo(1, { x: 0, y: 0 });
      return;
    }

    easeTo(clampScale(scale), { x: 0, y: 0 });
  };

  return { zoomValue, applyZoom };
};
