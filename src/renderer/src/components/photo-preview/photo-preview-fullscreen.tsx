import { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { getApi } from '#/hooks/use-ipc';
import { useMediaPoolStore } from '#/stores/media-pool.store';
import { type PhotoItem } from '#/types';
import { toMediaFileUrl } from '#/utils';

type PhotoPreviewFullscreenProps = {
  photo: PhotoItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PhotoPreviewFullscreen({ photo, open, onOpenChange }: PhotoPreviewFullscreenProps) {
  const photoRevision = useMediaPoolStore((state) =>
    photo ? (state.photoRevisions[photo.id] ?? 0) : 0
  );
  const src = photo?.path ? toMediaFileUrl(photo.path, photoRevision) : null;

  useEffect(() => {
    const api = getApi();
    if (!open) {
      void api.window?.setFullScreen(false);
      return;
    }

    void api.window?.setFullScreen(true);
    return () => {
      void api.window?.setFullScreen(false);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      event.preventDefault();
      onOpenChange(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  if (!open || !photo) {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.name}
      className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black"
      onClick={() => onOpenChange(false)}
    >
      {src ? (
        <img
          src={src}
          alt={photo.name}
          className="max-h-full max-w-full object-contain"
          onClick={(event) => event.stopPropagation()}
        />
      ) : (
        <p className="text-xs text-white/70">Preview not available for {photo.name}</p>
      )}
    </div>,
    document.body
  );
}
