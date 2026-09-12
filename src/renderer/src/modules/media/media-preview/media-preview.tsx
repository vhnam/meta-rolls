import { useState } from 'react';

import { useMediaPanzoom } from '#/hooks/use-media-panzoom';
import { type PhotoItem } from '#/types';
import { toMediaFileUrl } from '#/utils';

import MediaPreviewToolbar from './media-preview-toolbar';

type MediaPreviewProps = {
  photo: PhotoItem | null;
};

const MediaPreview = ({ photo }: MediaPreviewProps) => {
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const src = photo?.path ? toMediaFileUrl(photo.path) : null;
  const failed = src !== null && failedSrc === src;
  const canPanzoom = Boolean(photo && src && !failed && loadedSrc === src);
  const { zoomValue, applyZoom } = useMediaPanzoom({
    viewport,
    target: imageEl,
    enabled: canPanzoom,
    resetKey: src
  });

  return (
    <section className="flex min-h-0 min-w-0 flex-col overflow-hidden border border-border bg-card">
      <MediaPreviewToolbar
        photoName={photo?.name}
        zoomDisabled={!canPanzoom}
        zoomValue={zoomValue}
        onZoomChange={applyZoom}
      />
      <div
        ref={setViewport}
        className="flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden overscroll-none bg-card p-2"
      >
        {photo && src && !failed ? (
          <img
            ref={setImageEl}
            key={src}
            src={src}
            alt={photo.name}
            draggable={false}
            className="max-h-full max-w-full will-change-transform select-none object-contain"
            onLoad={() => setLoadedSrc(src)}
            onError={() => setFailedSrc(src)}
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
};

export default MediaPreview;
