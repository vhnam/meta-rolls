import { IconPhoto, IconPhotoFilled } from '@tabler/icons-react';
import { cn } from 'cn';

import { FILE_LIST_CELL_CLASS, FILE_LIST_ROW_CLASS } from '#/constants/media';
import { PhotoItem } from '#/types';
import { formatCreatedAt, formatFileSize, formatResolution } from '#/utils';

type MediaPhotoProps = {
  photo: PhotoItem;
  selectedPhotoId: string | null;
  onSelectPhoto: (id: string) => void;
};

const MediaPhoto = ({ photo, selectedPhotoId, onSelectPhoto }: MediaPhotoProps) => {
  const selected = photo.id === selectedPhotoId;

  return (
    <button
      type="button"
      className={cn(
        FILE_LIST_ROW_CLASS,
        'text-left',
        selected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-muted-foreground'
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

export default MediaPhoto;
