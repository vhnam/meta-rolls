import { useDraggable } from '@dnd-kit/react';
import { IconCheck } from '@tabler/icons-react';
import { useState } from 'react';

import { Spinner } from '#/components/ui/spinner';
import { THUMBNAIL_ASPECT_RATIO } from '#/constants/media';
import { useHeldMediaSrc } from '#/hooks/use-held-media-src';
import { useMediaPoolStore } from '#/stores/media-pool.store';
import { type PhotoItem, type PhotoRating } from '#/types';
import { toMediaFileUrl } from '#/utils';
import { cn } from '#/utils/common';

import { PhotoRatingStars } from './photo-rating-stars';

type PhotoThumbnailTileProps = {
  photo: PhotoItem;
  selected: boolean;
  placed?: boolean;
  dragId: string;
  dragData?: Record<string, unknown>;
  onSelectPhoto: (id: string) => void;
  rating?: number;
  onRatePhoto?: (id: string, rating: PhotoRating) => void;
};

export function PhotoThumbnailTile({
  photo,
  selected,
  placed = false,
  dragId,
  dragData,
  onSelectPhoto,
  rating,
  onRatePhoto
}: PhotoThumbnailTileProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const revision = useMediaPoolStore((state) => state.photoRevisions[photo.id] ?? 0);
  const isRotating = useMediaPoolStore((state) => state.rotatingPhotoId === photo.id);
  const src = photo.path ? toMediaFileUrl(photo.path, revision) : null;
  const heldSrc = useHeldMediaSrc(src);
  const failed = heldSrc !== null && failedSrc === heldSrc;
  const { ref, isDragging } = useDraggable({ id: dragId, data: dragData });
  const showRating = onRatePhoto !== undefined && (selected || (rating ?? 0) > 0);

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      data-photo-thumbnail=""
      className={cn(
        'flex w-full min-w-0 cursor-pointer flex-col items-center gap-0.5',
        isDragging && 'opacity-50'
      )}
      onClick={() => onSelectPhoto(photo.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelectPhoto(photo.id);
        }
      }}
    >
      <span
        className={cn(
          'relative flex w-full items-center justify-center overflow-hidden border border-border bg-black',
          selected && 'border-primary ring-1 ring-primary'
        )}
        style={{ aspectRatio: THUMBNAIL_ASPECT_RATIO }}
      >
        {heldSrc && !failed && (
          <img
            src={heldSrc}
            alt={photo.name}
            draggable={false}
            className="size-full select-none object-contain"
            onError={() => setFailedSrc(heldSrc)}
          />
        )}
        {isRotating ? (
          <span
            role="status"
            aria-label="Rotating photo"
            className="absolute inset-0 flex items-center justify-center bg-black/40"
          >
            <Spinner tone="inverted" />
          </span>
        ) : null}
        {placed ? (
          <span
            role="img"
            aria-label="Placed in layout"
            className="absolute top-1 right-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <IconCheck className="size-2.5" />
          </span>
        ) : null}
      </span>
      {onRatePhoto ? (
        <span className={showRating ? 'visible' : 'invisible'}>
          <PhotoRatingStars
            rating={rating ?? 0}
            interactive={selected}
            showClear
            onChange={(next) => onRatePhoto(photo.id, next)}
          />
        </span>
      ) : (
        <div className="h-1" />
      )}
      <span
        className={cn(
          'w-full truncate text-center text-tiny leading-none',
          selected ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {photo.name}
      </span>
    </div>
  );
}
