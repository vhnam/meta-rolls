import { useEffect } from 'react';

import {
  canGoBack,
  canGoForward,
  getActivePhotoId,
  getListPhotos,
  getSelectedFolder,
  useMediaPoolStore
} from '#/stores/media-pool.store';

import { MediaBrowserFileList } from './media-browser-file-list';
import { MediaBrowserFolderTree } from './media-browser-folder-tree';
import { MediaBrowserToolbar } from './media-browser-toolbar';

export const MediaBrowser = () => {
  const store = useMediaPoolStore();
  const selectedFolder = getSelectedFolder(store);
  const listPhotos = getListPhotos(store);
  const activePhotoId = getActivePhotoId(store);
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

  return (
    <div className="flex min-h-0 min-w-0 flex-col overflow-hidden border border-border">
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
      <div className="flex min-h-0 min-w-0 flex-1">
        <MediaBrowserFolderTree
          folders={store.folders}
          selectedFolderId={store.selectedFolderId}
          onSelectFolder={store.setSelectedFolderId}
          collapsed={store.folderTreeCollapsed}
        />
        <MediaBrowserFileList
          folders={childFolders}
          photos={listPhotos}
          selectedPhotoId={activePhotoId}
          selectedListFolderId={store.selectedListFolderId}
          onSelectPhoto={store.setSelectedPhotoId}
          onHighlightFolder={store.setSelectedListFolderId}
          onOpenFolder={store.setSelectedFolderId}
        />
      </div>
    </div>
  );
};
