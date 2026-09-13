import { useDroppable } from '@dnd-kit/react';

import { MediaPhotoThumbnailShell, MediaPhotoThumbnailTile } from '#/components/media-photo-list';
import { THUMBNAIL_PANE_CLASS } from '#/constants/media';
import { Album, type AlbumPhoto } from '#/types';
import { getThumbnailColumnCount, toPhotoItem } from '#/utils';

import { AlbumsDetailsPhotoContextMenu } from './albums-details-photo-context-menu';

type AlbumsDetailsThumbnailsProps = {
  album: Album;
  photos: AlbumPhoto[];
  selectedPhotoId: string | null;
  zoom: number;
  onSelectPhoto: (id: string) => void;
};

export const AlbumsDetailsThumbnails = ({
  album,
  photos,
  selectedPhotoId,
  zoom,
  onSelectPhoto
}: AlbumsDetailsThumbnailsProps) => {
  const columns = getThumbnailColumnCount(zoom);
  const { ref, isDropTarget } = useDroppable({
    id: album.id,
    data: { albumId: album.id }
  });

  return (
    <section className={THUMBNAIL_PANE_CLASS}>
      <MediaPhotoThumbnailShell
        isEmpty={photos.length === 0}
        emptyMessage="No photos found"
        columns={columns}
        droppable={{ ref, isDropTarget }}
      >
        {photos.map((photo) => (
          <AlbumsDetailsPhotoContextMenu
            key={photo.id}
            albumId={album.id}
            photoId={photo.id}
            onSelectPhoto={onSelectPhoto}
          >
            <MediaPhotoThumbnailTile
              photo={toPhotoItem(photo)}
              selected={photo.id === selectedPhotoId}
              dragId={`album-photo:${album.id}:${photo.id}`}
              dragData={{ photoId: photo.id, sourceAlbumId: album.id }}
              onSelectPhoto={onSelectPhoto}
            />
          </AlbumsDetailsPhotoContextMenu>
        ))}
      </MediaPhotoThumbnailShell>
    </section>
  );
};
