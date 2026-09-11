import { cn } from '#/lib/utils';
import { PhotoFolder, PhotoItem } from '#/types';
import { IconPhoto } from '@tabler/icons-react';
import { COLUMN_CLASSES } from './media-file-list';

type MediaPhotoProps = {
  photo: PhotoItem;
  selectedPhotoId: string | null;
  folders: PhotoFolder[];
  index: number;
  onSelectPhoto: (id: string) => void;
};

const MediaPhoto = ({ photo, selectedPhotoId, folders, index, onSelectPhoto }: MediaPhotoProps) => {
  const selected = photo.id === selectedPhotoId;
  const stripeIndex = folders.length + index;

  return (
    <button
      type="button"
      className={cn(
        'grid h-5.5 w-full min-w-[20rem] px-2 text-left',
        COLUMN_CLASSES,
        stripeIndex % 2 === 1 && 'bg-muted/40',
        selected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
      )}
      onClick={() => onSelectPhoto(photo.id)}
    >
      <span className="flex min-w-0 items-center gap-1.5 self-center">
        <IconPhoto className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate text-tiny">{photo.name}</span>
      </span>
      <span className="self-center text-tiny text-muted-foreground">{photo.date}</span>
      <span className="truncate self-center text-tiny text-muted-foreground">{photo.camera}</span>
    </button>
  );
};

export default MediaPhoto;
