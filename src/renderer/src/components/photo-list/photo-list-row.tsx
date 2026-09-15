import { useDraggable } from '@dnd-kit/react';
import { IconPhoto, IconPhotoFilled } from '@tabler/icons-react';
import { cn } from 'cn';

import { FILE_LIST_CELL_CLASS, FILE_LIST_ROW_CLASS } from '#/constants/media';
import { type PhotoItem, type PhotoRating } from '#/types';
import { formatCreatedAt, formatFileSize, formatResolution } from '#/utils';

import { PhotoRatingStars } from './photo-rating-stars';

type PhotoListRowProps = {
  photo: PhotoItem;
  selected: boolean;
  dragId: string;
  dragData?: Record<string, unknown>;
  onSelectPhoto: (id: string) => void;
  rating?: number;
  onRatePhoto?: (id: string, rating: PhotoRating) => void;
};

export const PhotoListRow = ({
  photo,
  selected,
  dragId,
  dragData,
  onSelectPhoto,
  rating,
  onRatePhoto
}: PhotoListRowProps) => {
  const { ref, isDragging } = useDraggable({ id: dragId, data: dragData });
  const showRating = onRatePhoto !== undefined;

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      className={cn(
        FILE_LIST_ROW_CLASS,
        'cursor-pointer text-left',
        selected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-muted-foreground',
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
      <span className={cn(FILE_LIST_CELL_CLASS, 'gap-1')}>
        {selected ? (
          <IconPhotoFilled className="size-3.5 shrink-0 text-accent-foreground" />
        ) : (
          <IconPhoto className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate text-tiny">{photo.name}</span>
      </span>
      {showRating ? (
        <span className={FILE_LIST_CELL_CLASS}>
          <PhotoRatingStars
            rating={rating ?? 0}
            interactive={selected}
            onChange={(next) => onRatePhoto(photo.id, next)}
          />
        </span>
      ) : null}
      <span className={cn(FILE_LIST_CELL_CLASS, 'truncate text-tiny')}>
        {formatCreatedAt(photo.createdAt)}
      </span>
      <span className={cn(FILE_LIST_CELL_CLASS, 'truncate text-tiny tabular-nums')}>
        {formatFileSize(photo.size)}
      </span>
      <span className={cn(FILE_LIST_CELL_CLASS, 'truncate text-tiny tabular-nums')}>
        {formatResolution(photo.width, photo.height)}
      </span>
    </div>
  );
};
