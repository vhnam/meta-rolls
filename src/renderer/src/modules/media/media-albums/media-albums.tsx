import { useState } from 'react';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '#/components/ui/resizable';
import { PHOTO_PANE } from '#/constants/media';
import { type AlbumSchema } from '#/schemas/album.schema';
import { useAlbumStore } from '#/stores/album.store';
import { useMediaPoolStore } from '#/stores/media-pool.store';
import { type Album } from '#/types';

import { MediaAlbumsAlbumDialog } from './media-albums-album-dialog';
import { MediaAlbumsList } from './media-albums-list';
import { MediaAlbumsSidebar } from './media-albums-sidebar';
import { MediaAlbumsThumbnails } from './media-albums-thumbnails';
import { MediaAlbumsToolbar } from './media-albums-toolbar';

export const MediaAlbums = () => {
  const store = useMediaPoolStore();
  const albums = useAlbumStore((state) => state.albums);
  const selectedId = useAlbumStore((state) => state.activeAlbumId);
  const view = useAlbumStore((state) => state.view);
  const zoom = useAlbumStore((state) => state.zoom);
  const albumListCollapsed = useAlbumStore((state) => state.albumListCollapsed);
  const onSelect = useAlbumStore((state) => state.setActiveAlbumId);
  const onViewChange = useAlbumStore((state) => state.setView);
  const onZoomChange = useAlbumStore((state) => state.setZoom);
  const onToggleAlbumList = useAlbumStore((state) => state.toggleAlbumList);
  const addAlbum = useAlbumStore((state) => state.addAlbum);
  const renameAlbum = useAlbumStore((state) => state.renameAlbum);
  const removeAlbum = useAlbumStore((state) => state.removeAlbum);
  const currentAlbum = albums.find((album) => album.id === selectedId);
  const albumPhotos = currentAlbum?.photos ?? [];
  const activePhotoId =
    store.photoPane === PHOTO_PANE.albums &&
    albumPhotos.some((photo) => photo.id === store.selectedPhotoId)
      ? store.selectedPhotoId
      : null;
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);

  const closeAlbumDialog = () => {
    setAlbumDialogOpen(false);
    setEditingAlbum(null);
  };

  const handleAlbumDialogOpenChange = (open: boolean) => {
    if (open) {
      setAlbumDialogOpen(true);
      return;
    }
    closeAlbumDialog();
  };

  const handleSaveAlbum = async (album: AlbumSchema) => {
    if (editingAlbum) {
      await renameAlbum(editingAlbum.id, album.name);
    } else {
      await addAlbum(album.name);
    }
    closeAlbumDialog();
  };

  const albumContent = (
    <>
      {view === 'thumbnail' && currentAlbum && (
        <MediaAlbumsThumbnails
          album={currentAlbum}
          photos={albumPhotos}
          selectedPhotoId={activePhotoId}
          onSelectPhoto={store.setSelectedPhotoId}
          zoom={zoom}
        />
      )}
      {view === 'list' && currentAlbum && (
        <MediaAlbumsList
          album={currentAlbum}
          photos={albumPhotos}
          selectedPhotoId={activePhotoId}
          onSelectPhoto={store.setSelectedPhotoId}
        />
      )}
    </>
  );

  return (
    <div
      className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden border border-border"
      onPointerDownCapture={() => store.setPhotoPane(PHOTO_PANE.albums)}
    >
      <MediaAlbumsToolbar
        view={view}
        zoom={zoom}
        folderTreeCollapsed={albumListCollapsed}
        onViewChange={onViewChange}
        onZoomChange={onZoomChange}
        onToggleFolderTree={onToggleAlbumList}
      />
      {albumListCollapsed ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{albumContent}</div>
      ) : (
        <ResizablePanelGroup orientation="horizontal" className="min-h-0 min-w-0 flex-1">
          <ResizablePanel defaultSize="13rem" minSize="8rem" maxSize="50%" className="min-h-0">
            <MediaAlbumsSidebar
              albums={albums}
              selectedId={selectedId}
              onSelect={onSelect}
              onAddAlbum={() => {
                setEditingAlbum(null);
                setAlbumDialogOpen(true);
              }}
              onRenameAlbum={(album) => {
                setEditingAlbum(album);
                setAlbumDialogOpen(true);
              }}
              onRemoveAlbum={removeAlbum}
            />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize="70%" minSize="30%" className="min-h-0 min-w-0">
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
              <div className="flex h-7 shrink-0 items-center border-b border-border bg-muted px-2">
                <span className="text-tiny font-medium">{currentAlbum?.name ?? 'Albums'}</span>
              </div>
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{albumContent}</div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}

      <MediaAlbumsAlbumDialog
        open={albumDialogOpen}
        album={editingAlbum}
        onOpenChange={handleAlbumDialogOpenChange}
        onSaveAlbum={handleSaveAlbum}
      />
    </div>
  );
};
