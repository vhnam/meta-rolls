import { useEffect } from 'react';

import { PHOTO_PANE } from '#/constants/media';
import { useAlbumStore } from '#/stores/album.store';
import { useMediaPoolStore } from '#/stores/media-pool.store';
import { type MediaView } from '#/types';
import { getThumbnailColumnCount, isEditableKeyboardTarget, toPhotoItem } from '#/utils';

const arrowSelectionStep = (key: string, view: MediaView, zoom: number) => {
  if (view === 'list') {
    if (key === 'ArrowUp' || key === 'ArrowLeft') {
      return -1;
    }
    if (key === 'ArrowDown' || key === 'ArrowRight') {
      return 1;
    }
    return null;
  }

  const columns = getThumbnailColumnCount(zoom);
  if (key === 'ArrowLeft') {
    return -1;
  }
  if (key === 'ArrowRight') {
    return 1;
  }
  if (key === 'ArrowUp') {
    return -columns;
  }
  if (key === 'ArrowDown') {
    return columns;
  }
  return null;
};

export const useMediaPhotoArrowSelection = () => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (isEditableKeyboardTarget(event.target)) {
        return;
      }

      const pool = useMediaPoolStore.getState();
      if (!pool.photoPane) {
        return;
      }

      const albums = useAlbumStore.getState();
      const extraPhotos = (
        albums.albums.find((album) => album.id === albums.activeAlbumId)?.photos ?? []
      ).map(toPhotoItem);
      const focusedAlbums = pool.photoPane === PHOTO_PANE.albums;
      const view = focusedAlbums ? albums.view : pool.view;
      const zoom = focusedAlbums ? albums.zoom : pool.zoom;
      const step = arrowSelectionStep(event.key, view, zoom);
      if (step === null) {
        return;
      }

      event.preventDefault();
      pool.selectRelativePhoto(step, extraPhotos);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
};
