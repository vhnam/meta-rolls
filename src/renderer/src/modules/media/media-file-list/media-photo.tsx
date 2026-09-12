import { IconPhoto, IconPhotoFilled } from '@tabler/icons-react';
import { cn } from 'cn';

import { FILE_LIST_COLUMN_CLASSES } from '#/constants/media';
import { PhotoItem } from '#/types';

type MediaPhotoProps = {
  photo: PhotoItem;
  selectedPhotoId: string | null;
  index: number;
  onSelectPhoto: (id: string) => void;
};

const MediaPhoto = ({ photo, selectedPhotoId, index, onSelectPhoto }: MediaPhotoProps) => {
  const selected = photo.id === selectedPhotoId;

  return (
    <button
      type="button"
      className={cn(
        'grid h-5.5 w-full min-w-[20rem] px-2 text-left',
        FILE_LIST_COLUMN_CLASSES,
        index % 2 === 1 && 'bg-muted/40',
        selected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-muted-foreground'
      )}
      onClick={() => onSelectPhoto(photo.id)}
    >
      <span className="flex min-w-0 items-center gap-1.5 self-center">
        {selected ? (
          <IconPhotoFilled className="size-3.5 shrink-0 text-accent-foreground" />
        ) : (
          <IconPhoto className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate text-tiny">{photo.name}</span>
      </span>
      <span className="self-center text-tiny">{photo.date}</span>
      <span className="truncate self-center text-tiny">{photo.camera}</span>
    </button>
  );
};

export default MediaPhoto;
