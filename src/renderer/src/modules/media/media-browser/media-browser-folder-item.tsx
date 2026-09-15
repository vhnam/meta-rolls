import {
  IconChevronDown,
  IconChevronRight,
  IconDeviceDesktop,
  IconFolder,
  IconFolderFilled,
  IconLoader2
} from '@tabler/icons-react';
import { createContext, useContext, type CSSProperties, type MouseEvent } from 'react';
import { type NodeApi, type NodeRendererProps } from 'react-arborist';

import { cn } from '#/lib/utils';
import { type PhotoFolder } from '#/types';
import { folderTreePaddingLeft } from '#/utils';

export type MediaBrowserFolderTreeUi = {
  loadingIds: ReadonlySet<string>;
  loadWithSpinner: (folder: PhotoFolder) => void;
};

export const MediaBrowserFolderTreeUiContext = createContext<MediaBrowserFolderTreeUi | null>(null);

const collectOpenDescendantIds = (node: NodeApi<PhotoFolder>): string[] => {
  const ids: string[] = [];
  const visit = (current: NodeApi<PhotoFolder>) => {
    for (const child of current.children ?? []) {
      if (child.isOpen) {
        ids.push(child.id);
      }
      visit(child);
    }
  };
  visit(node);
  return ids;
};

export function MediaBrowserFolderItem({ node, style }: NodeRendererProps<PhotoFolder>) {
  const ui = useContext(MediaBrowserFolderTreeUiContext);
  const folder = node.data;
  const selected = node.isSelected;
  const hasChildren = node.isInternal;
  const showSpinner = ui?.loadingIds.has(folder.id) ?? false;
  const rowStyle: CSSProperties = {
    ...style,
    paddingLeft: folderTreePaddingLeft(node.level)
  };

  const handleToggle = (event: MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    if (node.isOpen) {
      const keepOpen = collectOpenDescendantIds(node);
      node.close();
      for (const id of keepOpen) {
        node.tree.open(id);
      }
      return;
    }
    if (folder.children === undefined) {
      ui?.loadWithSpinner(folder);
    }
    node.open();
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
}
