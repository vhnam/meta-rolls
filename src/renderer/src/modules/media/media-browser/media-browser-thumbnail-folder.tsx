import { IconFolder, IconFolderFilled } from '@tabler/icons-react';
import { cn } from 'cn';

import { THUMBNAIL_ASPECT_RATIO } from '#/constants/media';
import { type PhotoFolder } from '#/types';

type MediaBrowserThumbnailFolderProps = {
  folder: PhotoFolder;
  selected: boolean;
  onHighlightFolder: (id: string) => void;
  onOpenFolder: (id: string) => void;
};

export const MediaBrowserThumbnailFolder = ({
  folder,
  selected,
  onHighlightFolder,
  onOpenFolder
}: MediaBrowserThumbnailFolderProps) => {
  return (
    <button
      type="button"
      className="flex min-w-0 flex-col items-center gap-1"
      onClick={() => onHighlightFolder(folder.id)}
      onDoubleClick={() => onOpenFolder(folder.id)}
    >
      <span
        className={cn(
          'flex w-full items-center justify-center overflow-hidden border border-border bg-muted',
          selected && 'border-primary ring-1 ring-primary'
        )}
        style={{ aspectRatio: THUMBNAIL_ASPECT_RATIO }}
      >
        {selected ? (
          <IconFolderFilled className="size-10 text-accent-foreground" />
        ) : (
          <IconFolder className="size-10 text-muted-foreground" />
        )}
      </span>
      <span className="w-full truncate text-center text-tiny text-muted-foreground">
        {folder.name}
      </span>
    </button>
  );
};
