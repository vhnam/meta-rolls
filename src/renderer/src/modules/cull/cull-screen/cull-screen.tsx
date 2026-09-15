import { useState } from 'react';

import { AlbumFormDialog } from '#/components/album-form-dialog';
import { AlbumSidebarShell } from '#/components/album-sidebar';
import { PhotoMetadata } from '#/components/photo-metadata';
import { PhotoPreview, PhotoPreviewFullscreen } from '#/components/photo-preview';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '#/components/ui/resizable';
import { useMediaPreviewFullscreen } from '#/hooks/use-media-preview-fullscreen';
import { AlbumSchema } from '#/schemas/album.schema';
import { useAlbumStore } from '#/stores/album.store';
import { getSelectedPhoto, useMediaPoolStore } from '#/stores/media-pool.store';
import { Album } from '#/types';
import { toPhotoItem } from '#/utils/album-photo';

import { CullDetails } from '../cull-details';

export function CullScreen() {
  const albums = useAlbumStore((state) => state.albums);
  const selectedId = useAlbumStore((state) => state.activeAlbumId);
  const onSelect = useAlbumStore((state) => state.setActiveAlbumId);
  const addAlbum = useAlbumStore((state) => state.addAlbum);
  const renameAlbum = useAlbumStore((state) => state.renameAlbum);
  const removeAlbum = useAlbumStore((state) => state.removeAlbum);
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);

  const store = useMediaPoolStore();
  const activeAlbumId = useAlbumStore((state) => state.activeAlbumId);
  const activeAlbumPhotos = useAlbumStore(
    (state) => state.albums.find((album) => album.id === activeAlbumId)?.photos ?? []
  );
  const selectedPhoto = getSelectedPhoto(store, activeAlbumPhotos.map(toPhotoItem));
  const { open: fullscreenOpen, setOpen: setFullscreenOpen } =
    useMediaPreviewFullscreen(selectedPhoto);

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
    <>
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
        <ResizablePanel defaultSize="85%" minSize="10%" className="min-h-0 min-w-0">
          <ResizablePanelGroup orientation="vertical" className="min-h-0">
            <ResizablePanel defaultSize="80%" minSize="20%" className="min-h-0 min-w-0">
              <PhotoPreview
                photo={selectedPhoto}
                toolbarClassName="shrink-0 border-border bg-sidebar-accent px-1"
              />
            </ResizablePanel>
            <ResizablePanel
              defaultSize="20%"
              minSize="15%"
              maxSize="30%"
              className="min-h-0 min-w-0"
            >
              <div className="h-full min-h-0 overflow-hidden">
                <CullDetails />
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

      <PhotoPreviewFullscreen
        photo={selectedPhoto}
        open={fullscreenOpen}
        onOpenChange={setFullscreenOpen}
      />
    </>
  );
}
