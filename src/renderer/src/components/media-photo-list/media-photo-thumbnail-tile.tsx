import { useDraggable } from '@dnd-kit/react';
import { cn } from 'cn';
import { useState } from 'react';

import { THUMBNAIL_ASPECT_RATIO } from '#/constants/media';
import { type PhotoItem } from '#/types';
import { toMediaFileUrl } from '#/utils';

type MediaPhotoThumbnailTileProps = {
  photo: PhotoItem;
  selected: boolean;
  dragId: string;
  dragData?: Record<string, unknown>;
  onSelectPhoto: (id: string) => void;
};

export const MediaPhotoThumbnailTile = ({
  photo,
  selected,
  dragId,
  dragData,
  onSelectPhoto
}: MediaPhotoThumbnailTileProps) => {
  const [failed, setFailed] = useState(false);
  const src = photo.path ? toMediaFileUrl(photo.path) : null;
  const { ref, isDragging } = useDraggable({ id: dragId, data: dragData });

  return (
    <button
      ref={ref}
      type="button"
      className={cn('flex w-full min-w-0 flex-col items-center gap-1', isDragging && 'opacity-50')}
      onClick={() => onSelectPhoto(photo.id)}
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
      <span
        className={cn(
          'w-full truncate text-center text-tiny',
          selected ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {photo.name}
      </span>
    </button>
  );
};
