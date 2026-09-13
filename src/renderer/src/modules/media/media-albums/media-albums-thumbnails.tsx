import { useDroppable } from '@dnd-kit/react';

import { MediaPhotoThumbnailShell, MediaPhotoThumbnailTile } from '#/components/media-photo-list';
import { THUMBNAIL_PANE_CLASS } from '#/constants/media';
import { Album, type AlbumPhoto } from '#/types';
import { getThumbnailColumnCount, toPhotoItem } from '#/utils';

type MediaAlbumsThumbnailsProps = {
  album: Album;
  photos: AlbumPhoto[];
  selectedPhotoId: string | null;
  zoom: number;
  onSelectPhoto: (id: string) => void;
};

export const MediaAlbumsThumbnails = ({
  album,
  photos,
  selectedPhotoId,
  zoom,
  onSelectPhoto
}: MediaAlbumsThumbnailsProps) => {
  const columns = getThumbnailColumnCount(zoom);
  const { ref, isDropTarget } = useDroppable({
    id: album.id,
    data: { albumId: album.id }
  });

  return (
    <section className={THUMBNAIL_PANE_CLASS}>
      <div className="flex h-7 shrink-0 items-center border-b border-border bg-muted px-2">
        <span className="text-tiny font-medium">{album.name}</span>
      </div>
      <MediaPhotoThumbnailShell
        isEmpty={photos.length === 0}
        emptyMessage="No photos found"
        columns={columns}
        droppable={{ ref, isDropTarget }}
      >
        {photos.map((photo) => (
          <MediaPhotoThumbnailTile
            key={photo.id}
            photo={toPhotoItem(photo)}
            selected={photo.id === selectedPhotoId}
            dragId={`album-photo:${album.id}:${photo.id}`}
            dragData={{ photoId: photo.id, sourceAlbumId: album.id }}
            onSelectPhoto={onSelectPhoto}
          />
        ))}
      </MediaPhotoThumbnailShell>
    </section>
  );
};
