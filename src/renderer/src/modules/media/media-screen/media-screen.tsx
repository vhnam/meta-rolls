import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '#/components/ui/resizable';
import { MediaAlbums } from '#/modules/media/media-albums';
import { MediaBrowser } from '#/modules/media/media-browser';
import { MediaMetadata } from '#/modules/media/media-metadata';
import { MediaPreview } from '#/modules/media/media-preview';
import { useAlbumStore } from '#/stores/album.store';
import { getSelectedPhoto, useMediaPoolStore } from '#/stores/media-pool.store';
import { toPhotoItem } from '#/utils';

const MediaScreen = () => {
  const store = useMediaPoolStore();
  const activeAlbumId = useAlbumStore((state) => state.activeAlbumId);
  const activeAlbumPhotos = useAlbumStore(
    (state) => state.albums.find((album) => album.id === activeAlbumId)?.photos ?? []
  );
  const selectedPhoto = getSelectedPhoto(store, activeAlbumPhotos.map(toPhotoItem));
  const addPhotoToAlbum = useAlbumStore((state) => state.addPhotoToAlbum);

  const handleDragEnd = (event: DragEndEvent) => {
    const albumId = event.operation.target?.id;
    const photoId = event.operation.source?.id;
    if (typeof albumId !== 'string' || typeof photoId !== 'string') {
      return;
    }
    const photo = useMediaPoolStore.getState().photos.find((item) => item.id === photoId);
    if (!photo?.path) {
      return;
    }
    void addPhotoToAlbum(albumId, {
      id: photo.id,
      name: photo.name,
      path: photo.path,
      size: photo.size,
      width: photo.width,
      height: photo.height,
      createdAt: photo.createdAt
    });
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <ResizablePanelGroup
        orientation="vertical"
        className="min-h-0 flex-1 bg-background text-foreground"
      >
        <ResizablePanel defaultSize="55%" minSize="20%" className="min-h-0 min-w-0">
          <ResizablePanelGroup orientation="horizontal" className="min-h-0">
            <ResizablePanel defaultSize="65%" minSize="20%" className="min-h-0 min-w-0">
              <MediaBrowser />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize="35%" minSize="20%" className="min-h-0 min-w-0">
              <MediaPreview photo={selectedPhoto} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize="45%" minSize="20%" className="min-h-0 min-w-0">
          <ResizablePanelGroup orientation="horizontal" className="min-h-0">
            <ResizablePanel defaultSize="65%" minSize="20%" className="min-h-0 min-w-0">
              <MediaAlbums />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize="35%" minSize="20%" className="min-h-0 min-w-0">
              <MediaMetadata photo={selectedPhoto} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </DragDropProvider>
  );
};

export default MediaScreen;
