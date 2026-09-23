import {
  IconChevronDown,
  IconChevronRight,
  IconDeviceDesktop,
  IconFolder,
  IconFolderOpenFilled,
  IconLoader2
} from '@tabler/icons-react';
import { createContext, useContext, type CSSProperties, type MouseEvent } from 'react';
import { type NodeApi, type NodeRendererProps } from 'react-arborist';

import { type FolderKind, type PhotoFolder } from '#/types';
import { folderTreePaddingLeft } from '#/utils';
import { cn } from '#/utils/common';

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

type FolderKindIconProps = {
  kind?: FolderKind;
  selected: boolean;
  isOpen: boolean;
};

function FolderKindIcon({ kind, selected, isOpen }: FolderKindIconProps) {
  const className = cn(
    'size-4 shrink-0',
    selected && 'text-accent-foreground',
    !selected && kind === 'disk' && 'text-sidebar-primary',
    !selected && kind !== 'disk' && 'text-muted-foreground'
  );

  if (kind === 'disk') {
    return <IconDeviceDesktop size={16} className={className} />;
  }

  if (selected || isOpen) {
    return <IconFolderOpenFilled size={16} className={className} />;
  }

  return <IconFolder size={16} className={className} />;
}

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
            <IconChevronDown size={12} className="size-3" />
          ) : (
            <IconChevronRight size={12} className="size-3" />
          )}
        </span>
      ) : (
        <span className="size-4" />
      )}
      <FolderKindIcon kind={folder.kind} selected={selected} isOpen={node.isOpen} />
      <span className="truncate font-mono text-tiny">{folder.name}</span>
    </div>
  );
}
