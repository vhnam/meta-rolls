import { useDroppable } from '@dnd-kit/react';

import { MediaPhotoThumbnailShell, MediaPhotoThumbnailTile } from '#/components/media-photo-list';
import { PhotoContextMenu } from '#/components/photo-context-menu';
import { THUMBNAIL_PANE_CLASS } from '#/constants/media';
import { Album, type AlbumPhoto, type PhotoRating } from '#/types';
import { getThumbnailStripWidth, toPhotoItem } from '#/utils';

type AlbumsDetailsThumbnailsProps = {
  album: Album;
  photos: AlbumPhoto[];
  selectedPhotoId: string | null;
  zoom: number;
  onSelectPhoto: (id: string) => void;
  onRatePhoto: (photoId: string, rating: PhotoRating) => void;
};

export const AlbumsDetailsThumbnails = ({
  album,
  photos,
  selectedPhotoId,
  zoom,
  onSelectPhoto,
  onRatePhoto
}: AlbumsDetailsThumbnailsProps) => {
  const itemWidth = getThumbnailStripWidth(zoom);
  const { ref, isDropTarget } = useDroppable({
    id: album.id,
    data: { albumId: album.id }
  });

  return (
    <section className={THUMBNAIL_PANE_CLASS}>
      <MediaPhotoThumbnailShell
        isEmpty={photos.length === 0}
        emptyMessage="No photos found"
        layout="row"
        itemWidth={itemWidth}
        droppable={{ ref, isDropTarget }}
      >
        {photos.map((photo) => (
          <PhotoContextMenu
            key={photo.id}
            albumId={album.id}
            photoId={photo.id}
            onSelectPhoto={onSelectPhoto}
          >
            <div className="w-(--thumb-width) shrink-0">
              <MediaPhotoThumbnailTile
                photo={toPhotoItem(photo)}
                selected={photo.id === selectedPhotoId}
                dragId={`album-photo:${album.id}:${photo.id}`}
                dragData={{ photoId: photo.id, sourceAlbumId: album.id }}
                onSelectPhoto={onSelectPhoto}
                rating={photo.rating}
                onRatePhoto={onRatePhoto}
              />
            </div>
          </PhotoContextMenu>
        ))}
      </MediaPhotoThumbnailShell>
    </section>
  );
};
