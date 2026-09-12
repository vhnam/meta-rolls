import { useDraggable } from '@dnd-kit/react';
import { IconPhoto, IconPhotoFilled } from '@tabler/icons-react';
import { cn } from 'cn';

import { FILE_LIST_CELL_CLASS, FILE_LIST_ROW_CLASS } from '#/constants/media';
import { PhotoItem } from '#/types';
import { formatCreatedAt, formatFileSize, formatResolution } from '#/utils';

type MediaBrowserFileListPhotoProps = {
  photo: PhotoItem;
  selectedPhotoId: string | null;
  onSelectPhoto: (id: string) => void;
};

export const MediaBrowserFileListPhoto = ({
  photo,
  selectedPhotoId,
  onSelectPhoto
}: MediaBrowserFileListPhotoProps) => {
  const selected = photo.id === selectedPhotoId;
  const { ref, isDragging } = useDraggable({
    id: photo.id,
    data: { photoId: photo.id }
  });

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        FILE_LIST_ROW_CLASS,
        'text-left',
        selected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-muted-foreground',
        isDragging && 'opacity-50'
      )}
      onClick={() => onSelectPhoto(photo.id)}
    >
      <span className={cn(FILE_LIST_CELL_CLASS, 'gap-1')}>
        {selected ? (
          <IconPhotoFilled className="size-3.5 shrink-0 text-accent-foreground" />
        ) : (
          <IconPhoto className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate text-tiny">{photo.name}</span>
      </span>
      <span className={cn(FILE_LIST_CELL_CLASS, 'truncate text-tiny')}>
        {formatCreatedAt(photo.createdAt)}
      </span>
      <span className={cn(FILE_LIST_CELL_CLASS, 'truncate text-tiny tabular-nums')}>
        {formatFileSize(photo.size)}
      </span>
      <span className={cn(FILE_LIST_CELL_CLASS, 'truncate text-tiny tabular-nums')}>
        {formatResolution(photo.width, photo.height)}
      </span>
    </button>
  );
};
