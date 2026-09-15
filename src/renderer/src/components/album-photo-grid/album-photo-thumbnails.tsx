import { useDroppable } from '@dnd-kit/react';

import { PhotoContextMenu } from '#/components/photo-context-menu';
import { PhotoThumbnailShell, PhotoThumbnailTile } from '#/components/photo-list';
import { THUMBNAIL_PANE_CLASS } from '#/constants/media';
import { type Album, type AlbumPhoto, type PhotoRating } from '#/types';
import { getThumbnailColumnCount, getThumbnailStripWidth, toPhotoItem } from '#/utils';

type AlbumPhotoThumbnailsProps = {
  album: Album;
  photos: AlbumPhoto[];
  selectedPhotoId: string | null;
  zoom: number;
  layout?: 'grid' | 'row';
  onSelectPhoto: (id: string) => void;
  onRatePhoto?: (photoId: string, rating: PhotoRating) => void;
};

export const AlbumPhotoThumbnails = ({
  album,
  photos,
  selectedPhotoId,
  zoom,
  layout = 'grid',
  onSelectPhoto,
  onRatePhoto
}: AlbumPhotoThumbnailsProps) => {
  const isRow = layout === 'row';
  const columns = isRow ? undefined : getThumbnailColumnCount(zoom);
  const itemWidth = isRow ? getThumbnailStripWidth(zoom) : undefined;
  const { ref, isDropTarget } = useDroppable({
    id: album.id,
    data: { albumId: album.id }
  });

  return (
    <section className={THUMBNAIL_PANE_CLASS}>
      <PhotoThumbnailShell
        isEmpty={photos.length === 0}
        emptyMessage="No photos found"
        layout={layout}
        columns={columns}
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
            {isRow ? (
              <div className="w-(--thumb-width) shrink-0">
                <PhotoThumbnailTile
                  photo={toPhotoItem(photo)}
                  selected={photo.id === selectedPhotoId}
                  dragId={`album-photo:${album.id}:${photo.id}`}
                  dragData={{ photoId: photo.id, sourceAlbumId: album.id }}
                  onSelectPhoto={onSelectPhoto}
                  rating={photo.rating}
                  onRatePhoto={onRatePhoto}
                />
              </div>
            ) : (
              <PhotoThumbnailTile
                photo={toPhotoItem(photo)}
                selected={photo.id === selectedPhotoId}
                dragId={`album-photo:${album.id}:${photo.id}`}
                dragData={{ photoId: photo.id, sourceAlbumId: album.id }}
                onSelectPhoto={onSelectPhoto}
                rating={photo.rating}
                onRatePhoto={onRatePhoto}
              />
            )}
          </PhotoContextMenu>
        ))}
      </PhotoThumbnailShell>
    </section>
  );
};
