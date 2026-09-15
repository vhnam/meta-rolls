import { useDraggable } from '@dnd-kit/react';
import { useState } from 'react';

import { THUMBNAIL_ASPECT_RATIO } from '#/constants/media';
import { cn } from '#/lib/utils';
import { type PhotoItem, type PhotoRating } from '#/types';
import { toMediaFileUrl } from '#/utils';

import { PhotoRatingStars } from './photo-rating-stars';

type PhotoThumbnailTileProps = {
  photo: PhotoItem;
  selected: boolean;
  dragId: string;
  dragData?: Record<string, unknown>;
  onSelectPhoto: (id: string) => void;
  rating?: number;
  onRatePhoto?: (id: string, rating: PhotoRating) => void;
};

export const PhotoThumbnailTile = ({
  photo,
  selected,
  dragId,
  dragData,
  onSelectPhoto,
  rating,
  onRatePhoto
}: PhotoThumbnailTileProps) => {
  const [failed, setFailed] = useState(false);
  const src = photo.path ? toMediaFileUrl(photo.path) : null;
  const { ref, isDragging } = useDraggable({ id: dragId, data: dragData });
  const showRating = onRatePhoto !== undefined && (selected || (rating ?? 0) > 0);

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
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
          'flex w-full items-center justify-center overflow-hidden border border-border bg-black',
          selected && 'border-primary ring-1 ring-primary'
        )}
        style={{ aspectRatio: THUMBNAIL_ASPECT_RATIO }}
      >
        {src && !failed && (
          <img
            src={src}
            alt={photo.name}
            draggable={false}
            className="size-full select-none object-contain"
            onError={() => setFailed(true)}
          />
        )}
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
};
