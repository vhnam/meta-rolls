import { PHOTO_PANE } from '#/constants/media';
import { useAlbumStore } from '#/stores/album.store';
import { useMediaPoolStore } from '#/stores/media-pool.store';

import { AlbumsDetailsList } from './albums-details-list';
import { AlbumsDetailsThumbnails } from './albums-details-thumbnails';
import { AlbumsDetailsToolbar } from './albums-details-toolbar';

export const AlbumsDetails = () => {
  const store = useMediaPoolStore();
  const albums = useAlbumStore((state) => state.albums);
  const selectedId = useAlbumStore((state) => state.activeAlbumId);
  const view = useAlbumStore((state) => state.view);
  const zoom = useAlbumStore((state) => state.zoom);
  const onViewChange = useAlbumStore((state) => state.setView);
  const onZoomChange = useAlbumStore((state) => state.setZoom);
  const currentAlbum = albums.find((album) => album.id === selectedId);
  const albumPhotos = currentAlbum?.photos ?? [];
  const activePhotoId =
    store.photoPane === PHOTO_PANE.albums &&
    albumPhotos.some((photo) => photo.id === store.selectedPhotoId)
      ? store.selectedPhotoId
      : null;

  const albumContent = (
    <>
      {view === 'thumbnail' && currentAlbum && (
        <AlbumsDetailsThumbnails
          album={currentAlbum}
          photos={albumPhotos}
          selectedPhotoId={activePhotoId}
          onSelectPhoto={store.setSelectedPhotoId}
          zoom={zoom}
        />
      )}
      {view === 'list' && currentAlbum && (
        <AlbumsDetailsList
          album={currentAlbum}
          photos={albumPhotos}
          selectedPhotoId={activePhotoId}
          onSelectPhoto={store.setSelectedPhotoId}
        />
      )}
    </>
  );

  return (
    <>
      <AlbumsDetailsToolbar
        view={view}
        zoom={zoom}
        album={currentAlbum}
        onViewChange={onViewChange}
        onZoomChange={onZoomChange}
      />
      {albumContent}
    </>
  );
};
