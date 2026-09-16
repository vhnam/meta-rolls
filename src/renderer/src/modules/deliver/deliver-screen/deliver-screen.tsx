import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react';
import { useEffect, useMemo, useState } from 'react';

import { AlbumDetails } from '#/components/album-details';
import { AlbumFormDialog } from '#/components/album-form-dialog';
import { AlbumSidebarShell } from '#/components/album-sidebar';
import { PhotoMetadata } from '#/components/photo-metadata';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '#/components/ui/resizable';
import { PHOTO_PANE } from '#/constants/media';
import { useMediaPhotoArrowSelection } from '#/hooks/use-media-photo-arrow-selection';
import { AlbumSchema } from '#/schemas/album.schema';
import { useAlbumStore } from '#/stores/album.store';
import { useCanvasStore } from '#/stores/canvas.store';
import { getSelectedPhoto, useMediaPoolStore } from '#/stores/media-pool.store';
import { Album } from '#/types';
import { readDragString } from '#/utils/common';
import { toPhotoItem } from '#/utils/photo/album-photo';

import { DeliverCanvas } from '../deliver-canvas';
import { DeliverPageStrip } from '../deliver-page-strip';

export function DeliverScreen() {
  const albums = useAlbumStore((state) => state.albums);
  const selectedId = useAlbumStore((state) => state.activeAlbumId);
  const onSelect = useAlbumStore((state) => state.setActiveAlbumId);
  const addAlbum = useAlbumStore((state) => state.addAlbum);
  const renameAlbum = useAlbumStore((state) => state.renameAlbum);
  const removeAlbum = useAlbumStore((state) => state.removeAlbum);
  const movePhotoToAlbum = useAlbumStore((state) => state.movePhotoToAlbum);
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);

  const store = useMediaPoolStore();
  const activeAlbumId = useAlbumStore((state) => state.activeAlbumId);
  const activeAlbumPhotos = useAlbumStore(
    (state) => state.albums.find((album) => album.id === activeAlbumId)?.photos ?? []
  );
  const albumPhotoItems = activeAlbumPhotos.map(toPhotoItem);
  const selectedPhoto = getSelectedPhoto(store, albumPhotoItems);
  const spreadPhotoIds = useCanvasStore((state) => state.spreadPhotoIds);
  const placedPhotoIds = useMemo(
    () => new Set(spreadPhotoIds.flat().filter((id): id is string => id !== null)),
    [spreadPhotoIds]
  );

  useMediaPhotoArrowSelection();
  useEffect(() => {
    useMediaPoolStore.getState().setPhotoPane(PHOTO_PANE.albums);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) {
      return;
    }
    const target = event.operation.target;
    const source = event.operation.source;
    const albumId = readDragString(target?.data, 'albumId') ?? target?.id;
    const photoId = readDragString(source?.data, 'photoId') ?? source?.id;
    const sourceAlbumId = readDragString(source?.data, 'sourceAlbumId');
    if (
      typeof albumId !== 'string' ||
      typeof photoId !== 'string' ||
      typeof sourceAlbumId !== 'string'
    ) {
      return;
    }
    if (sourceAlbumId === albumId) {
      return;
    }
    void movePhotoToAlbum(sourceAlbumId, albumId, photoId);
  };

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

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <ResizablePanelGroup
        orientation="horizontal"
        className="min-h-0 flex-1 bg-background text-foreground"
      >
        <ResizablePanel defaultSize="15%" minSize="10%" maxSize="30%" className="min-h-0 min-w-0">
          <ResizablePanelGroup orientation="vertical" className="min-h-0">
            <ResizablePanel defaultSize="50%" minSize="20%" className="min-h-0 min-w-0">
              <AlbumSidebarShell
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
            <ResizablePanel defaultSize="50%" minSize="20%" className="min-h-0 min-w-0">
              <PhotoMetadata photo={selectedPhoto} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize="10%" minSize="8%" maxSize="20%" className="min-h-0 min-w-0">
          <DeliverPageStrip />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize="75%" minSize="10%" className="min-h-0 min-w-0">
          <ResizablePanelGroup orientation="vertical" className="min-h-0">
            <ResizablePanel defaultSize="80%" minSize="20%" className="min-h-0 min-w-0">
              <DeliverCanvas albumId={activeAlbumId} photos={albumPhotoItems} />
            </ResizablePanel>
            <ResizablePanel
              defaultSize="20%"
              minSize="15%"
              maxSize="30%"
              className="min-h-0 min-w-0"
            >
              <div className="h-full min-h-0 overflow-hidden">
                <AlbumDetails placedPhotoIds={placedPhotoIds} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>

      <AlbumFormDialog
        open={albumDialogOpen}
        album={editingAlbum}
        onOpenChange={handleAlbumDialogOpenChange}
        onSaveAlbum={handleSaveAlbum}
      />
    </DragDropProvider>
  );
}
