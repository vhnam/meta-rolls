import { cn } from 'cn';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Tree, type TreeApi } from 'react-arborist';

import {
  FOLDER_SPINNER_DELAY_MS,
  FOLDER_TREE_DEPTH_STEP,
  FOLDER_TREE_ROW_HEIGHT
} from '#/constants/media';
import { useMediaPoolStore } from '#/stores/media-pool.store';
import { type PhotoFolder } from '#/types';
import { findFolder, folderTreeChildren, isFolderInPath } from '#/utils';

import MediaFolderItem, { MediaFolderTreeUiContext } from './media-folder-item';

type MediaFolderTreeProps = {
  folders: PhotoFolder[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
  collapsed?: boolean;
};

type Size = {
  width: number;
  height: number;
};

const MediaFolderTree = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  collapsed = false
}: MediaFolderTreeProps) => {
  const loadFolderChildren = useMediaPoolStore((state) => state.loadFolderChildren);
  const treeRef = useRef<TreeApi<PhotoFolder> | undefined>(undefined);
  const measureRef = useRef<HTMLDivElement>(null);
  const pendingLoads = useRef(new Map<string, Promise<void>>());
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
      return;
    }
    const tree = treeRef.current;
    const folder = findFolder(folders, selectedFolderId);
    if (!tree || !folder) {
      return;
    }
    const node = tree.get(folder.id);
    node?.openParents();
    node?.open();
  }, [folders, selectedFolderId, size]);

  const treeUi = useMemo(
    () => ({ selectedFolderId, loadingIds, loadWithSpinner }),
    [selectedFolderId, loadingIds, loadWithSpinner]
  );

  return (
    <aside
      className={cn(
        'flex min-h-0 shrink-0 flex-col border-inline-end border-sidebar-border bg-sidebar',
        collapsed ? 'hidden' : 'w-52'
      )}
    >
      <div ref={measureRef} className="min-h-0 flex-1">
        {size.width > 0 && size.height > 0 ? (
          <MediaFolderTreeUiContext.Provider value={treeUi}>
            <Tree<PhotoFolder>
              ref={treeRef}
              data={folders}
              childrenAccessor={folderTreeChildren}
              width={size.width}
              height={size.height}
              indent={FOLDER_TREE_DEPTH_STEP}
              rowHeight={FOLDER_TREE_ROW_HEIGHT}
              openByDefault={false}
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
                void loadWithSpinner(node.data);
              }}
              onToggle={(id) => {
                if (isFolderInPath(id, selectedFolderId)) {
                  treeRef.current?.open(id);
                  return;
                }
                const node = treeRef.current?.get(id);
                if (node?.isOpen) {
                  void loadWithSpinner(node.data);
                }
              }}
            >
              {MediaFolderItem}
            </Tree>
          </MediaFolderTreeUiContext.Provider>
        ) : null}
      </div>
    </aside>
  );
};

export default MediaFolderTree;
