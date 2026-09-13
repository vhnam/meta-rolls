import { useEffect, useRef, useState } from 'react';

import { getApi } from '#/hooks/use-ipc';
import { type PhotoItem } from '#/types';
import { isEditableKeyboardTarget } from '#/utils';

const isPhotoFullscreenShortcut = (event: KeyboardEvent) =>
  event.key.toLowerCase() === 'f' &&
  (event.metaKey || event.ctrlKey) &&
  !event.altKey &&
  !event.shiftKey &&
  !event.repeat;

export const useMediaPreviewFullscreen = (photo: PhotoItem | null) => {
  const [open, setOpen] = useState(false);
  const lastToggleAtRef = useRef(0);

  if (!photo && open) {
    setOpen(false);
  }

  useEffect(() => {
    const toggle = () => {
      const now = Date.now();
      if (now - lastToggleAtRef.current < 80) {
        return;
      }
      lastToggleAtRef.current = now;
      setOpen((current) => (current ? false : photo !== null));
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isPhotoFullscreenShortcut(event) || isEditableKeyboardTarget(event.target)) {
        return;
      }
      event.preventDefault();
      toggle();
    };

    const unsubscribeToggle = getApi().menu?.onTogglePhotoFullscreen(toggle);
    const unsubscribeLeave = getApi().window?.onLeaveFullScreen(() => setOpen(false));
    window.addEventListener('keydown', onKeyDown);
    return () => {
      unsubscribeToggle?.();
      unsubscribeLeave?.();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [photo]);

  return { open, setOpen };
};
