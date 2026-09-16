import { IconFolder } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Tree, type TreeApi } from 'react-arborist';

import { Empty, EmptyContent, EmptyDescription, EmptyMedia } from '#/components/ui/empty';
import {
  FOLDER_SPINNER_DELAY_MS,
  FOLDER_TREE_DEPTH_STEP,
  FOLDER_TREE_ROW_HEIGHT
} from '#/constants/media';
import { useMediaPoolStore } from '#/stores/media-pool.store';
import { type PhotoFolder } from '#/types';
import { findFolder, folderTreeChildren } from '#/utils';
import { cn } from '#/utils/common';

import {
  MediaBrowserFolderItem,
  MediaBrowserFolderTreeUiContext
} from './media-browser-folder-item';

type MediaBrowserFolderTreeProps = {
  folders: PhotoFolder[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
  collapsed?: boolean;
};

type Size = {
  width: number;
  height: number;
};

const toOpenMap = (folderIds: string[]) => Object.fromEntries(folderIds.map((id) => [id, true]));

export function MediaBrowserFolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  collapsed = false
}: MediaBrowserFolderTreeProps) {
  const loadFolderChildren = useMediaPoolStore((state) => state.loadFolderChildren);
  const openFolderIds = useMediaPoolStore((state) => state.openFolderIds);
  const setOpenFolderIds = useMediaPoolStore((state) => state.setOpenFolderIds);
  const treeRef = useRef<TreeApi<PhotoFolder> | undefined>(undefined);
  const measureRef = useRef<HTMLDivElement>(null);
  const pendingLoads = useRef(new Map<string, Promise<void>>());
  const lastExpandedSelection = useRef<string | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const [loadingIds, setLoadingIds] = useState<ReadonlySet<string>>(() => new Set());

  const loadWithSpinner = useCallback(
    (folder: PhotoFolder) => {
      const existing = pendingLoads.current.get(folder.id);
      if (existing) {
        return existing;
      }

      const timer = window.setTimeout(() => {
        setLoadingIds((current) => {
          const next = new Set(current);
          next.add(folder.id);
          return next;
        });
      }, FOLDER_SPINNER_DELAY_MS);

      const request = loadFolderChildren(folder).finally(() => {
        window.clearTimeout(timer);
        pendingLoads.current.delete(folder.id);
        setLoadingIds((current) => {
          if (!current.has(folder.id)) {
            return current;
          }
          const next = new Set(current);
          next.delete(folder.id);
          return next;
        });
      });

      pendingLoads.current.set(folder.id, request);
      return request;
    },
    [loadFolderChildren]
  );

  const syncOpenFolderIds = useCallback(() => {
    const tree = treeRef.current;
    const openState = tree?.openState;
    if (!tree || !openState) {
      return;
    }
    const fromTree = Object.keys(openState).filter((id) => openState[id]);
    const pending = openFolderIds.filter((id) => !tree.get(id));
    setOpenFolderIds([...fromTree, ...pending]);
  }, [openFolderIds, setOpenFolderIds]);
  const syncOpenFolderIdsRef = useRef(syncOpenFolderIds);

  useEffect(() => {
    syncOpenFolderIdsRef.current = syncOpenFolderIds;
  }, [syncOpenFolderIds]);

  useEffect(() => {
    const element = measureRef.current;
    if (!element || collapsed) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      setSize((current) =>
        current.width === width && current.height === height ? current : { width, height }
      );
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [collapsed]);

  useEffect(() => {
    if (size.width === 0 || size.height === 0) {
      lastExpandedSelection.current = null;
      return;
    }
    const tree = treeRef.current;
    const folder = findFolder(folders, selectedFolderId);
    if (!tree || !folder) {
      return;
    }
    if (lastExpandedSelection.current === selectedFolderId) {
      return;
    }
    const node = tree.get(folder.id);
    node?.openParents();
    node?.open();
    lastExpandedSelection.current = selectedFolderId;
    void tree.scrollTo(folder.id, 'center');
    syncOpenFolderIdsRef.current();
  }, [folders, selectedFolderId, size]);

  useEffect(() => {
    const tree = treeRef.current;
    if (!tree || folders.length === 0 || size.width === 0 || size.height === 0) {
      return;
    }
    for (const id of openFolderIds) {
      if (!tree.isOpen(id)) {
        tree.open(id);
      }
    }
  }, [folders, openFolderIds, size]);

  const treeUi = useMemo(() => ({ loadingIds, loadWithSpinner }), [loadingIds, loadWithSpinner]);

  return (
    <aside
      className={cn(
        'flex min-h-0 min-w-0 flex-col border-r border-sidebar-border bg-sidebar',
        collapsed ? 'hidden' : 'h-full w-full'
      )}
    >
      <div ref={measureRef} className="min-h-0 flex-1">
        {folders.length === 0 ? (
          <Empty className="h-full">
            <EmptyMedia variant="icon">
              <IconFolder />
            </EmptyMedia>
            <EmptyContent>
              <EmptyDescription>No folders found</EmptyDescription>
            </EmptyContent>
          </Empty>
        ) : size.width > 0 && size.height > 0 ? (
          <MediaBrowserFolderTreeUiContext.Provider value={treeUi}>
            <Tree<PhotoFolder>
              ref={treeRef}
              data={folders}
              childrenAccessor={folderTreeChildren}
              width={size.width}
              height={size.height}
              indent={FOLDER_TREE_DEPTH_STEP}
              rowHeight={FOLDER_TREE_ROW_HEIGHT}
              openByDefault={false}
              initialOpenState={toOpenMap(openFolderIds)}
              disableDrag
              disableDrop
              disableEdit
              disableMultiSelection
              disableDeselectOnClick
              selection={selectedFolderId}
              className="scroll-fade"
              rowClassName="outline-none"
              onActivate={(node) => {
                onSelectFolder(node.id);
                node.open();
                if (node.data.children === undefined) {
                  void loadWithSpinner(node.data);
                }
                syncOpenFolderIdsRef.current();
              }}
              onToggle={(id) => {
                const node = treeRef.current?.get(id);
                if (node?.isOpen && node.data.children === undefined) {
                  void loadWithSpinner(node.data);
                }
                syncOpenFolderIdsRef.current();
              }}
            >
              {MediaBrowserFolderItem}
            </Tree>
          </MediaBrowserFolderTreeUiContext.Provider>
        ) : null}
      </div>
    </aside>
  );
}
