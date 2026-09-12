import {
  IconChevronDown,
  IconChevronRight,
  IconDeviceDesktop,
  IconFolder,
  IconFolderFilled,
  IconLoader2
} from '@tabler/icons-react';
import { cn } from 'cn';
import { createContext, useContext, type CSSProperties, type MouseEvent } from 'react';
import { type NodeRendererProps } from 'react-arborist';

import { type PhotoFolder } from '#/types';
import { folderTreePaddingLeft, isFolderInPath } from '#/utils';

export type MediaFolderTreeUi = {
  selectedFolderId: string;
  loadingIds: ReadonlySet<string>;
  loadWithSpinner: (folder: PhotoFolder) => void;
};

export const MediaFolderTreeUiContext = createContext<MediaFolderTreeUi | null>(null);

const MediaFolderItem = ({ node, style }: NodeRendererProps<PhotoFolder>) => {
  const ui = useContext(MediaFolderTreeUiContext);
  const folder = node.data;
  const selected = node.isSelected;
  const hasChildren = node.isInternal;
  const showSpinner = ui?.loadingIds.has(folder.id) ?? false;
  const inSelectedPath = ui ? isFolderInPath(folder.id, ui.selectedFolderId) : false;
  const rowStyle: CSSProperties = {
    ...style,
    paddingLeft: folderTreePaddingLeft(node.level)
  };

  const handleToggle = (event: MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    if (inSelectedPath && node.isOpen) {
      return;
    }
    if (node.isClosed) {
      ui?.loadWithSpinner(folder);
    }
    node.toggle();
  };

  return (
    <div
      className={cn(
        'flex h-6 w-full items-center gap-1 pr-2 text-left cursor-pointer',
        selected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-muted-foreground'
      )}
      style={rowStyle}
      aria-busy={showSpinner}
    >
      {showSpinner ? (
        <span className="flex size-4 items-center justify-center text-muted-foreground">
          <IconLoader2 className="size-3 animate-spin" />
        </span>
      ) : hasChildren ? (
        <span
          className="flex size-4 items-center justify-center text-muted-foreground"
          onClick={handleToggle}
        >
          {node.isOpen ? (
            <IconChevronDown className="size-3" />
          ) : (
            <IconChevronRight className="size-3" />
          )}
        </span>
      ) : (
        <span className="size-4" />
      )}
      {folder.kind === 'disk' ? (
        <IconDeviceDesktop
          className={cn(
            'size-3.5 shrink-0',
            selected ? 'text-accent-foreground' : 'text-sidebar-primary'
          )}
        />
      ) : selected ? (
        <IconFolderFilled className="size-3.5 shrink-0 text-accent-foreground" />
      ) : (
        <IconFolder className="size-3.5 shrink-0 text-muted-foreground" />
      )}
      <span className="truncate font-mono text-tiny">{folder.name}</span>
    </div>
  );
};

export default MediaFolderItem;
