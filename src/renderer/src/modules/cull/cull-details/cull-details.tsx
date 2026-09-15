import { AlbumPhotoList, AlbumPhotoThumbnails } from '#/components/album-photo-grid';
import { AlbumPhotoToolbar } from '#/components/album-photo-toolbar';
import { useAlbumStore } from '#/stores/album.store';
import { useMediaPoolStore } from '#/stores/media-pool.store';
import { type PhotoRating } from '#/types';

export function CullDetails() {
  const store = useMediaPoolStore();
  const albums = useAlbumStore((state) => state.albums);
  const selectedId = useAlbumStore((state) => state.activeAlbumId);
  const view = useAlbumStore((state) => state.view);
  const zoom = useAlbumStore((state) => state.zoom);
  const onViewChange = useAlbumStore((state) => state.setView);
  const onZoomChange = useAlbumStore((state) => state.setZoom);
  const rateAlbumPhoto = useAlbumStore((state) => state.rateAlbumPhoto);
  const currentAlbum = albums.find((album) => album.id === selectedId);
  const albumPhotos = currentAlbum?.photos ?? [];
  const activePhotoId = albumPhotos.some((photo) => photo.id === store.selectedPhotoId)
    ? store.selectedPhotoId
    : null;

  const handleRatePhoto = (photoId: string, rating: PhotoRating) => {
    if (!currentAlbum) {
      return;
    }
    void rateAlbumPhoto(currentAlbum.id, photoId, rating);
  };

  const albumContent = (
    <>
      {view === 'thumbnail' && currentAlbum && (
        <AlbumPhotoThumbnails
          album={currentAlbum}
          photos={albumPhotos}
          selectedPhotoId={activePhotoId}
          onSelectPhoto={store.setSelectedPhotoId}
          onRatePhoto={handleRatePhoto}
          layout="row"
          zoom={zoom}
        />
      )}
      {view === 'list' && currentAlbum && (
        <AlbumPhotoList
          album={currentAlbum}
          photos={albumPhotos}
          selectedPhotoId={activePhotoId}
          onSelectPhoto={store.setSelectedPhotoId}
          onRatePhoto={handleRatePhoto}
        />
      )}
    </>
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <AlbumPhotoToolbar
        title={currentAlbum?.name ?? 'Albums'}
        view={view}
        zoom={zoom}
        onViewChange={onViewChange}
        onZoomChange={onZoomChange}
        zoomSeparator
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{albumContent}</div>
    </div>
  );
}
