import { useCallback, useRef, useState } from 'react';

import { getApi } from '#/hooks/use-ipc';
import { useMediaPanzoom } from '#/hooks/use-media-panzoom';
import { useMediaPhotoRotate } from '#/hooks/use-media-photo-rotate';
import { useAlbumStore } from '#/stores/album.store';
import { useMediaPoolStore } from '#/stores/media-pool.store';
import { type Album, type PhotoItem, type PhotoRotateDirection } from '#/types';
import { toMediaFileUrl } from '#/utils';

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

export function PhotoPreview({ photo, toolbarClassName }: PhotoPreviewProps) {
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const albums = useAlbumStore((state) => state.albums);
  const activeAlbumId = useAlbumStore((state) => state.activeAlbumId);
  const rateAlbumPhoto = useAlbumStore((state) => state.rateAlbumPhoto);
  const swapAlbumPhotoDimensions = useAlbumStore((state) => state.swapPhotoDimensions);
  const swapPoolPhotoDimensions = useMediaPoolStore((state) => state.swapPhotoDimensions);
  const setPhotoRevision = useMediaPoolStore((state) => state.setPhotoRevision);
  const photoRevision = useMediaPoolStore((state) =>
    photo ? (state.photoRevisions[photo.id] ?? 0) : 0
  );
  const ratingAlbumId = photo ? findAlbumIdForPhoto(albums, activeAlbumId, photo.id) : null;
  const src = photo?.path ? toMediaFileUrl(photo.path, photoRevision) : null;
  const failed = src !== null && failedSrc === src;
  const canPanzoom = Boolean(photo && src && !failed && loadedSrc === src);
  const { zoomValue, applyZoom } = useMediaPanzoom({
    viewport,
    target: imageEl,
    enabled: canPanzoom,
    resetKey: src
  });

  const rotatingRef = useRef(false);
  const rotatePhoto = useCallback(
    (direction: PhotoRotateDirection) => {
      if (!photo?.path || rotatingRef.current) {
        return;
      }
      const filePath = photo.path;
      const photoId = photo.id;
      rotatingRef.current = true;
      void getApi()
        .media.rotateImage(filePath, direction)
        .then((result) => {
          setPhotoRevision(photoId, result.mtimeMs);
          swapPoolPhotoDimensions(photoId);
          swapAlbumPhotoDimensions(photoId);
        })
        .finally(() => {
          rotatingRef.current = false;
        });
    },
    [photo, setPhotoRevision, swapAlbumPhotoDimensions, swapPoolPhotoDimensions]
  );
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
        className="flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden overscroll-none bg-card p-2"
      >
        {photo && src && !failed ? (
          <PhotoPreviewImage
            key={src}
            src={src}
            name={photo.name}
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
        ) : photo && !src ? (
          <div className="aspect-3/2 h-full max-h-full w-full max-w-180" aria-label={photo.name} />
        ) : photo ? (
          <p className="text-xs text-muted-foreground">Preview not available for {photo.name}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Select a photo to preview</p>
        )}
      </div>
    </section>
  );
}
