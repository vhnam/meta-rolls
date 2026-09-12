import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react';

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
      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-[minmax(0,1.15fr)_minmax(0,1fr)] bg-background text-foreground">
        <MediaBrowser />
        <MediaPreview photo={selectedPhoto} />
        <MediaAlbums />
        <MediaMetadata photo={selectedPhoto} />
      </div>
    </DragDropProvider>
  );
};

export default MediaScreen;
