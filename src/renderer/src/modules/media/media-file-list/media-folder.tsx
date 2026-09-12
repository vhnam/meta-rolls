import { IconFolder, IconFolderFilled } from '@tabler/icons-react';
import { cn } from 'cn';

import { FILE_LIST_COLUMN_CLASSES } from '#/constants/media';
import { PhotoFolder } from '#/types';

type MediaFolderProps = {
  folder: PhotoFolder;
  index: number;
  selected: boolean;
  onHighlightFolder: (id: string) => void;
  onOpenFolder: (id: string) => void;
};

const MediaFolder = ({
  folder,
  index,
  selected,
  onHighlightFolder,
  onOpenFolder
}: MediaFolderProps) => {
  return (
    <button
      type="button"
      className={cn(
        'grid h-5.5 w-full min-w-[20rem] px-2 text-left',
        FILE_LIST_COLUMN_CLASSES,
        index % 2 === 1 && 'bg-muted/40',
        selected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-muted-foreground'
      )}
      onClick={() => onHighlightFolder(folder.id)}
      onDoubleClick={() => onOpenFolder(folder.id)}
    >
      <span className="flex min-w-0 items-center gap-1.5 self-center">
        {selected ? (
          <IconFolderFilled className="size-3.5 shrink-0 text-accent-foreground" />
        ) : (
          <IconFolder className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate font-mono text-xs">{folder.name}</span>
      </span>
      <span />
      <span />
    </button>
  );
};

export default MediaFolder;
