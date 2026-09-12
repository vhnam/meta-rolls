import { IconFolder, IconFolderFilled } from '@tabler/icons-react';
import { cn } from 'cn';

import { FILE_LIST_CELL_CLASS, FILE_LIST_ROW_CLASS } from '#/constants/media';
import { PhotoFolder } from '#/types';

type MediaBrowserFileListFolderProps = {
  folder: PhotoFolder;
  selected: boolean;
  onHighlightFolder: (id: string) => void;
  onOpenFolder: (id: string) => void;
};

export const MediaBrowserFileListFolder = ({
  folder,
  selected,
  onHighlightFolder,
  onOpenFolder
}: MediaBrowserFileListFolderProps) => {
  return (
    <button
      type="button"
      className={cn(
        FILE_LIST_ROW_CLASS,
        'text-left',
        selected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-muted-foreground'
      )}
      onClick={() => onHighlightFolder(folder.id)}
      onDoubleClick={() => onOpenFolder(folder.id)}
    >
      <span className={cn(FILE_LIST_CELL_CLASS, 'gap-1')}>
        {selected ? (
          <IconFolderFilled className="size-3.5 shrink-0 text-accent-foreground" />
        ) : (
          <IconFolder className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate text-tiny">{folder.name}</span>
      </span>
      <span />
      <span />
      <span />
    </button>
  );
};
