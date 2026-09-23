import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react';

import { PhotoMetadata } from '#/components/photo-metadata';
import { PhotoPreview, PhotoPreviewFullscreen } from '#/components/photo-preview';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '#/components/ui/resizable';
import { useMediaPhotoArrowSelection } from '#/hooks/use-media-photo-arrow-selection';
import { useMediaPreviewFullscreen } from '#/hooks/use-media-preview-fullscreen';
import { MediaAlbums } from '#/modules/media/media-albums';
import { MediaBrowser } from '#/modules/media/media-browser';
import { selectActiveAlbumPhotos, useAlbumStore } from '#/stores/album.store';
import { getSelectedPhoto, useMediaPoolStore } from '#/stores/media-pool.store';
import { readDragString, toPhotoItem } from '#/utils';

export default function MediaScreen() {
  const store = useMediaPoolStore();
  const activeAlbumPhotos = useAlbumStore(selectActiveAlbumPhotos);
  const selectedPhoto = getSelectedPhoto(store, activeAlbumPhotos.map(toPhotoItem));
  const { open: fullscreenOpen, setOpen: setFullscreenOpen } =
    useMediaPreviewFullscreen(selectedPhoto);
  useMediaPhotoArrowSelection();
  const addPhotoToAlbum = useAlbumStore((state) => state.addPhotoToAlbum);
  const movePhotoToAlbum = useAlbumStore((state) => state.movePhotoToAlbum);

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) {
      return;
    }
    const target = event.operation.target;
    const source = event.operation.source;
    const albumId = readDragString(target?.data, 'albumId') ?? target?.id;
    const photoId = readDragString(source?.data, 'photoId') ?? source?.id;
    const sourceAlbumId = readDragString(source?.data, 'sourceAlbumId');
    if (typeof albumId !== 'string' || typeof photoId !== 'string') {
      return;
    }
    if (sourceAlbumId === albumId) {
      return;
    }
    if (sourceAlbumId) {
      void movePhotoToAlbum(sourceAlbumId, albumId, photoId);
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
      createdAt: photo.createdAt,
      rating: 0
    });
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <ResizablePanelGroup orientation="vertical" className="min-h-0 flex-1">
        <ResizablePanel defaultSize="55%" minSize="20%" className="min-h-0 min-w-0">
          <ResizablePanelGroup orientation="horizontal" className="min-h-0">
            <ResizablePanel defaultSize="65%" minSize="20%" className="min-h-0 min-w-0">
              <MediaBrowser />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize="35%" minSize="20%" className="min-h-0 min-w-0">
              <PhotoPreview
                photo={selectedPhoto}
                toolbarClassName="border-sidebar-border bg-muted"
              />
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
              <PhotoMetadata photo={selectedPhoto} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
      <PhotoPreviewFullscreen
        photo={selectedPhoto}
        open={fullscreenOpen}
        onOpenChange={setFullscreenOpen}
      />
    </DragDropProvider>
  );
}
