import { useEffect } from 'react';

import { getApi } from '#/hooks/use-ipc';
import { type PhotoRotateDirection } from '#/types';
import { isEditableKeyboardTarget } from '#/utils';

const isRotateModifier = (event: KeyboardEvent) =>
  (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey;

export const photoRotateDirectionFromShortcut = (
  event: KeyboardEvent
): PhotoRotateDirection | null => {
  if (event.repeat || !isRotateModifier(event)) {
    return null;
  }
  if (event.key === '[' || event.code === 'BracketLeft') {
    return 'ccw';
  }
  if (event.key === ']' || event.code === 'BracketRight') {
    return 'cw';
  }
  return null;
};

export const useMediaPhotoRotate = (rotatePhoto?: (direction: PhotoRotateDirection) => void) => {
  useEffect(() => {
    if (!rotatePhoto) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableKeyboardTarget(event.target)) {
        return;
      }
      const direction = photoRotateDirectionFromShortcut(event);
      if (!direction) {
        return;
      }
      event.preventDefault();
      rotatePhoto(direction);
    };

    const unsubscribeCw = getApi().menu?.onRotatePhotoCw(() => rotatePhoto('cw'));
    const unsubscribeCcw = getApi().menu?.onRotatePhotoCcw(() => rotatePhoto('ccw'));
    window.addEventListener('keydown', onKeyDown);
    return () => {
      unsubscribeCw?.();
      unsubscribeCcw?.();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [rotatePhoto]);
};
