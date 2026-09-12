import { MediaAlbums } from '#/modules/media/media-albums';
import { MediaBrowser } from '#/modules/media/media-browser';
import { MediaGrid } from '#/modules/media/media-grid';
import { MediaMetadata } from '#/modules/media/media-metadata';
import { MediaPreview } from '#/modules/media/media-preview';
import {
  getActivePhotoId,
  getGridPhotos,
  getSelectedPhoto,
  useMediaPoolStore
} from '#/stores/media-pool.store';

const MediaScreen = () => {
  const store = useMediaPoolStore();
  const gridPhotos = getGridPhotos(store);
  const activePhotoId = getActivePhotoId(store);
  const selectedPhoto = getSelectedPhoto(store);

  return (
    <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-[minmax(0,1.15fr)_minmax(0,1fr)] bg-background text-foreground">
      <MediaBrowser />
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
