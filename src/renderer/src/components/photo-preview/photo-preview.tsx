import { useCallback, useEffect, useRef, useState } from 'react';

import { Spinner } from '#/components/ui/spinner';
import { getApi } from '#/hooks/use-ipc';
import { useMediaPanzoom } from '#/hooks/use-media-panzoom';
import { useMediaPhotoRotate } from '#/hooks/use-media-photo-rotate';
import { useAlbumStore } from '#/stores/album.store';
import { useMediaPoolStore } from '#/stores/media-pool.store';
import { type Album, type PhotoItem, type PhotoRotateDirection } from '#/types';
import { toMediaFileUrl } from '#/utils';
import { cn } from '#/utils/common';
import {
  PHOTO_ROTATE_MS,
  PHOTO_ROTATE_QUEUE_MAX,
  photoRotateDegrees,
  photoRotateFitScale,
  preloadMediaImage,
  waitMs
} from '#/utils/preview';

import { PhotoPreviewImage } from './photo-preview-image';
import { PhotoPreviewToolbar } from './photo-preview-toolbar';

const findAlbumIdForPhoto = (
  albums: Album[],
  activeAlbumId: string | null,
  photoId: string
): string | null => {
  const activeAlbum = albums.find((album) => album.id === activeAlbumId);
  if (activeAlbum?.photos.some((photo) => photo.id === photoId)) {
    return activeAlbum.id;
  }

  return albums.find((album) => album.photos.some((photo) => photo.id === photoId))?.id ?? null;
};

type PhotoPreviewProps = {
  photo: PhotoItem | null;
  toolbarClassName?: string;
};

type PreviewSpin = {
  src: string;
  degrees: number;
  scale: number;
  animate: boolean;
};

export function PhotoPreview({ photo, toolbarClassName }: PhotoPreviewProps) {
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const albums = useAlbumStore((state) => state.albums);
  const activeAlbumId = useAlbumStore((state) => state.activeAlbumId);
  const rateAlbumPhoto = useAlbumStore((state) => state.rateAlbumPhoto);
  const photoRevision = useMediaPoolStore((state) =>
    photo ? (state.photoRevisions[photo.id] ?? 0) : 0
  );
  const ratingAlbumId = photo ? findAlbumIdForPhoto(albums, activeAlbumId, photo.id) : null;
  const src = photo?.path ? toMediaFileUrl(photo.path, photoRevision) : null;
  const queueRef = useRef<PhotoRotateDirection[]>([]);
  const runningRef = useRef(false);
  const photoRef = useRef(photo);
  const spinRef = useRef<PreviewSpin | null>(null);
  const srcRef = useRef(src);
  const imageElRef = useRef(imageEl);
  const viewportRef = useRef(viewport);
  const [spin, setSpin] = useState<PreviewSpin | null>(null);
  const displaySrc = spin?.src ?? src;
  const failed = displaySrc !== null && failedSrc === displaySrc;
  const canPanzoom = Boolean(
    photo &&
    displaySrc &&
    !failed &&
    loadedSrc === displaySrc &&
    (spin?.degrees ?? 0) === 0 &&
    !isRotating
  );
  const { zoomValue, applyZoom } = useMediaPanzoom({
    viewport,
    target: imageEl,
    enabled: canPanzoom,
    resetKey: displaySrc
  });

  useEffect(() => {
    photoRef.current = photo;
    spinRef.current = spin;
    srcRef.current = src;
    imageElRef.current = imageEl;
    viewportRef.current = viewport;
  }, [imageEl, photo, spin, src, viewport]);

  useEffect(() => {
    if (runningRef.current) {
      return;
    }
    setSpin(src ? { src, degrees: 0, scale: 1, animate: false } : null);
  }, [src]);

  const rotatePhoto = useCallback((direction: PhotoRotateDirection) => {
    if (!photoRef.current?.path || queueRef.current.length >= PHOTO_ROTATE_QUEUE_MAX) {
      return;
    }
    queueRef.current.push(direction);

    const drain = async () => {
      if (runningRef.current) {
        return;
      }
      runningRef.current = true;
      setIsRotating(true);

      try {
        while (queueRef.current.length > 0) {
          const nextDirection = queueRef.current.shift();
          const currentPhoto = photoRef.current;
          const currentSrc = spinRef.current?.src ?? srcRef.current;
          if (!nextDirection || !currentPhoto?.path || !currentSrc) {
            queueRef.current = [];
            break;
          }

          useMediaPoolStore.getState().setRotatingPhotoId(currentPhoto.id);
          const image = imageElRef.current;
          const view = viewportRef.current;
          const scale = image && view ? photoRotateFitScale(image, view) : 1;
          const nextSpin = {
            src: currentSrc,
            degrees: photoRotateDegrees(nextDirection),
            scale,
            animate: true
          };
          spinRef.current = nextSpin;
          setSpin(nextSpin);

          try {
            const [result] = await Promise.all([
              getApi().media.rotateImage(currentPhoto.path, nextDirection),
              waitMs(PHOTO_ROTATE_MS)
            ]);
            if (photoRef.current?.id !== currentPhoto.id) {
              queueRef.current = [];
              break;
            }
            const nextSrc = toMediaFileUrl(currentPhoto.path, result.mtimeMs);
            await preloadMediaImage(nextSrc).catch(() => undefined);
            const settled = { src: nextSrc, degrees: 0, scale: 1, animate: false };
            spinRef.current = settled;
            setSpin(settled);
            setLoadedSrc(nextSrc);
            useMediaPoolStore.getState().setPhotoRevision(currentPhoto.id, result.mtimeMs);
            useMediaPoolStore.getState().swapPhotoDimensions(currentPhoto.id);
            useAlbumStore.getState().swapPhotoDimensions(currentPhoto.id);
          } catch {
            if (photoRef.current?.id === currentPhoto.id) {
              const reset = { src: currentSrc, degrees: 0, scale: 1, animate: true };
              spinRef.current = reset;
              setSpin(reset);
            }
          }
        }
      } finally {
        runningRef.current = false;
        setIsRotating(false);
        useMediaPoolStore.getState().setRotatingPhotoId(null);
        if (queueRef.current.length > 0) {
          void drain();
        }
      }
    };

    void drain();
  }, []);
  useMediaPhotoRotate(photo?.path ? rotatePhoto : undefined);

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden border border-border bg-card">
      <PhotoPreviewToolbar
        photoName={photo?.name}
        zoomDisabled={!canPanzoom}
        zoomValue={zoomValue}
        onZoomChange={applyZoom}
        className={toolbarClassName}
      />
      <div
        ref={setViewport}
        className="relative flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden overscroll-none bg-card p-2"
      >
        {photo && displaySrc && !failed ? (
          <PhotoPreviewImage
            key={photo.id}
            src={displaySrc}
            name={photo.name}
            className={cn(spin?.animate && 'ease-out transition-transform')}
            style={
              spin && (spin.degrees !== 0 || spin.scale !== 1)
                ? {
                    transform: `rotate(${spin.degrees}deg) scale(${spin.scale})`,
                    transitionDuration: spin.animate ? `${PHOTO_ROTATE_MS}ms` : undefined
                  }
                : undefined
            }
            onImage={setImageEl}
            onLoad={setLoadedSrc}
            onError={setFailedSrc}
            onRatePhoto={
              ratingAlbumId
                ? (rating) => void rateAlbumPhoto(ratingAlbumId, photo.id, rating)
                : undefined
            }
            onRotatePhoto={photo.path ? rotatePhoto : undefined}
          />
        ) : photo && !displaySrc ? (
          <div className="aspect-3/2 h-full max-h-full w-full max-w-180" aria-label={photo.name} />
        ) : photo ? (
          <p className="text-xs text-muted-foreground">Preview not available for {photo.name}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Select a photo to preview</p>
        )}
        {isRotating ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/40">
            <Spinner className="size-6" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
