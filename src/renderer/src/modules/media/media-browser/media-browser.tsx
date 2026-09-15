import { useEffect } from 'react';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '#/components/ui/resizable';
import { PHOTO_PANE } from '#/constants/media';
import {
  canGoBack,
  canGoForward,
  getActivePhotoId,
  getListPhotos,
  getSelectedFolder,
  useMediaPoolStore
} from '#/stores/media-pool.store';

import { MediaBrowserFolderTree } from './media-browser-folder-tree';
import { MediaBrowserList } from './media-browser-list';
import { MediaBrowserThumbnails } from './media-browser-thumbnails';
import { MediaBrowserToolbar } from './media-browser-toolbar';

export function MediaBrowser() {
  const store = useMediaPoolStore();
  const selectedFolder = getSelectedFolder(store);
  const listPhotos = getListPhotos(store);
  const activePhotoId = store.photoPane === PHOTO_PANE.browser ? getActivePhotoId(store) : null;
  const childFolders = selectedFolder?.children ?? [];

  useEffect(() => {
    void store.loadVolumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const folder = getSelectedFolder(useMediaPoolStore.getState());
    if (folder) {
      void useMediaPoolStore.getState().loadFolderChildren(folder);
    }
  }, [store.selectedFolderId]);

  const content =
    store.view === 'thumbnail' ? (
      <MediaBrowserThumbnails
        folders={childFolders}
        photos={listPhotos}
        selectedPhotoId={activePhotoId}
        selectedListFolderId={store.selectedListFolderId}
        zoom={store.zoom}
        onSelectPhoto={store.setSelectedPhotoId}
        onHighlightFolder={store.setSelectedListFolderId}
        onOpenFolder={store.setSelectedFolderId}
      />
    ) : (
      <MediaBrowserList
        folders={childFolders}
        photos={listPhotos}
        selectedPhotoId={activePhotoId}
        selectedListFolderId={store.selectedListFolderId}
        onSelectPhoto={store.setSelectedPhotoId}
        onHighlightFolder={store.setSelectedListFolderId}
        onOpenFolder={store.setSelectedFolderId}
      />
    );

  return (
    <div
      className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden border border-border"
      onPointerDownCapture={() => store.setPhotoPane(PHOTO_PANE.browser)}
    >
      <MediaBrowserToolbar
        query={store.query}
        onQueryChange={store.setQuery}
        view={store.view}
        onViewChange={store.setView}
        zoom={store.zoom}
        onZoomChange={store.setZoom}
        folderTreeCollapsed={store.folderTreeCollapsed}
        onToggleFolderTree={store.toggleFolderTree}
        currentFolderName={selectedFolder?.name ?? 'Media Storage'}
        canGoBack={canGoBack(store)}
        canGoForward={canGoForward(store)}
        onBack={store.goBack}
        onForward={store.goForward}
        onRefresh={() => {
          void store.refresh();
        }}
      />
      {store.folderTreeCollapsed ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{content}</div>
      ) : (
        <ResizablePanelGroup orientation="horizontal" className="min-h-0 min-w-0 flex-1">
          <ResizablePanel defaultSize="13rem" minSize="8rem" maxSize="50%" className="min-h-0">
            <MediaBrowserFolderTree
              folders={store.folders}
              selectedFolderId={store.selectedFolderId}
              onSelectFolder={store.setSelectedFolderId}
            />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize="70%" minSize="30%" className="min-h-0 min-w-0">
            <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">{content}</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
}
