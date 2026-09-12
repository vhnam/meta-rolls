import { useState } from 'react';

import { type PhotoItem } from '#/types';
import { toMediaFileUrl } from '#/utils';

type MediaPreviewProps = {
  photo: PhotoItem | null;
};

const MediaPreview = ({ photo }: MediaPreviewProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = photo?.path ? toMediaFileUrl(photo.path) : null;
  const failed = src !== null && failedSrc === src;

  return (
    <section className="flex min-h-0 min-w-0 flex-col overflow-hidden border border-border bg-card">
      <div className="flex min-h-0 flex-1 items-center justify-center bg-card p-2">
        {photo && src && !failed ? (
          <img
            src={src}
            alt={photo.name}
            className="max-h-full max-w-full object-contain"
            onError={() => setFailedSrc(src)}
          />
        ) : photo && !src ? (
          <div
            className="aspect-3/2 h-full max-h-full w-full max-w-180"
            style={{ background: photo.accent }}
            aria-label={photo.name}
          />
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
