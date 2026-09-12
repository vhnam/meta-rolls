import {
  IconChevronDown,
  IconChevronRight,
  IconDeviceDesktop,
  IconFolder,
  IconFolderFilled,
  IconLoader2
} from '@tabler/icons-react';
import { cn } from 'cn';
import { useEffect, useRef, useState, type MouseEvent } from 'react';

import { isFolderInPath } from '#/lib/find-folder';
import { useMediaPoolStore } from '#/stores/media-pool.store';
import { type PhotoFolder } from '#/types';

const SPINNER_DELAY_MS = 150;

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
  const loadFolderChildren = useMediaPoolStore((state) => state.loadFolderChildren);
  const hasChildren = folder.hasChildren ?? Boolean(folder.children?.length);
  const inSelectedPath = isFolderInPath(folder.id, selectedFolderId);
  const [userOpen, setUserOpen] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const loadRequest = useRef<Promise<void> | null>(null);
  const rowRef = useRef<HTMLButtonElement>(null);
  const selected = folder.id === selectedFolderId;
  const open = inSelectedPath || userOpen;

  const loadWithSpinner = () => {
    if (loadRequest.current) {
      return loadRequest.current;
    }

    const timer = window.setTimeout(() => {
      setShowSpinner(true);
    }, SPINNER_DELAY_MS);

    loadRequest.current = loadFolderChildren(folder).finally(() => {
      window.clearTimeout(timer);
      setShowSpinner(false);
      loadRequest.current = null;
    });

    return loadRequest.current;
  };

  useEffect(() => {
    if (selected) {
      rowRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [selected]);

  const handleSelect = () => {
    onSelectFolder(folder.id);
    void loadWithSpinner();
    setUserOpen(true);
  };

  const handleToggle = (event: MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    if (inSelectedPath) {
      return;
    }
    if (!userOpen) {
      void loadWithSpinner();
    }
    setUserOpen((current) => !current);
  };

  return (
    <div>
      <button
        ref={rowRef}
        type="button"
        aria-busy={showSpinner}
        className={cn(
          'flex h-6 w-full items-center gap-1 pr-2 text-left',
          selected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-muted-foreground'
        )}
        style={{ paddingLeft: 8 + depth * 12 }}
        onClick={handleSelect}
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
        <span className="truncate font-mono text-xs">{folder.name}</span>
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
