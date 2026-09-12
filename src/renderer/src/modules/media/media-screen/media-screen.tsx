import { useEffect } from 'react';

import { MediaAlbums } from '#/modules/media/media-albums';
import { MediaFileList } from '#/modules/media/media-file-list';
import { MediaFolderTree } from '#/modules/media/media-folder-tree';
import { MediaGrid } from '#/modules/media/media-grid';
import { MediaMetadata } from '#/modules/media/media-metadata';
import { MediaPreview } from '#/modules/media/media-preview';
import { MediaToolbar } from '#/modules/media/media-toolbar';
import {
  canGoBack,
  canGoForward,
  getActivePhotoId,
  getGridPhotos,
  getListPhotos,
  getSelectedFolder,
  getSelectedPhoto,
  useMediaPoolStore
} from '#/stores/media-pool.store';

const MediaScreen = () => {
  const store = useMediaPoolStore();
  const selectedFolder = getSelectedFolder(store);
  const listPhotos = getListPhotos(store);
  const gridPhotos = getGridPhotos(store);
  const activePhotoId = getActivePhotoId(store);
  const selectedPhoto = getSelectedPhoto(store);
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
    <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-[minmax(0,1.15fr)_minmax(0,1fr)] bg-background text-foreground">
      <div className="flex flex-col min-h-0 min-w-0 overflow-hidden border border-border">
        <MediaToolbar
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
          <MediaFolderTree
            folders={store.folders}
            selectedFolderId={store.selectedFolderId}
            onSelectFolder={store.setSelectedFolderId}
            collapsed={store.folderTreeCollapsed}
          />
          <MediaFileList
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
      <MediaPreview photo={selectedPhoto} />
      <div className="flex min-h-0 min-w-0 overflow-hidden border border-border">
        <MediaAlbums selectedId={store.selectedLibraryId} onSelect={store.setSelectedLibraryId} />
        <MediaGrid
          photos={gridPhotos}
          selectedPhotoId={activePhotoId}
          onSelectPhoto={store.setSelectedPhotoId}
          zoom={store.zoom}
        />
      </div>
      <MediaMetadata photo={selectedPhoto} />
    </div>
  );
};

export default MediaScreen;
