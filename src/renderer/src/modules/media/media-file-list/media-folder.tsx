import { cn } from '#/lib/utils';
import { PhotoFolder } from '#/types';
import { IconFolder } from '@tabler/icons-react';
import { COLUMN_CLASSES } from './media-file-list';

type MediaFolderProps = {
  folder: PhotoFolder;
  index: number;
  onSelectFolder: (id: string) => void;
};

const MediaFolder = ({ folder, index, onSelectFolder }: MediaFolderProps) => {
  return (
    <button
      type="button"
      className={cn(
        'grid h-5.5 w-full min-w-[20rem] px-2 text-left text-tiny hover:bg-muted',
        COLUMN_CLASSES,
        index % 2 === 1 && 'bg-muted/40'
      )}
      onClick={() => onSelectFolder(folder.id)}
    >
      <span className="flex min-w-0 items-center gap-1.5 self-center">
        <IconFolder className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{folder.name}</span>
      </span>
      <span />
      <span />
    </button>
  );
};

export default MediaFolder;
