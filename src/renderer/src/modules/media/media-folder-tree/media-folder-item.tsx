import { useState } from 'react';
import {
  IconChevronDown,
  IconChevronRight,
  IconDeviceDesktop,
  IconFolder
} from '@tabler/icons-react';
import { type PhotoFolder } from '#/modules/media/media-data';
import { cn } from '#/lib/utils';

type MediaFolderItemProps = {
  folder: PhotoFolder;
  depth: number;
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
};

const MediaFolderItem = ({
  folder,
  depth,
  selectedFolderId,
  onSelectFolder
}: MediaFolderItemProps) => {
  const hasChildren = Boolean(folder.children?.length);
  const [open, setOpen] = useState(false);
  const selected = folder.id === selectedFolderId;

  return (
    <div>
      <button
        type="button"
        className={cn(
          'flex h-6 w-full items-center gap-1 pr-2 text-left text-[11px] text-sidebar-foreground hover:bg-sidebar-accent/70',
          selected && 'bg-sidebar-accent text-sidebar-accent-foreground'
        )}
        style={{ paddingLeft: 8 + depth * 12 }}
        onClick={() => onSelectFolder(folder.id)}
      >
        {hasChildren ? (
          <span
            className="flex size-4 items-center justify-center text-muted-foreground"
            onClick={(event) => {
              event.stopPropagation();
              setOpen((current) => !current);
            }}
          >
            {open ? (
              <IconChevronDown className="size-3" />
            ) : (
              <IconChevronRight className="size-3" />
            )}
          </span>
        ) : (
          <span className="size-4" />
        )}
        {folder.kind === 'disk' ? (
          <IconDeviceDesktop className="size-3.5 shrink-0 text-sidebar-primary" />
        ) : (
          <IconFolder className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">{folder.name}</span>
      </button>
      {open && hasChildren
        ? folder.children?.map((child) => (
            <MediaFolderItem
              key={child.id}
              folder={child}
              depth={depth + 1}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
            />
          ))
        : null}
    </div>
  );
};

export default MediaFolderItem;
