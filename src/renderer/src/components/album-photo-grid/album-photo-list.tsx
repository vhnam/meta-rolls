import { useDroppable } from '@dnd-kit/react';

import { MediaPhotoListRow, MediaPhotoListShell } from '#/components/media-photo-list';
import { PhotoContextMenu } from '#/components/photo-context-menu';
import { ALBUM_FILE_LIST_COLUMNS } from '#/constants/media';
import { type Album, type AlbumPhoto, type PhotoRating } from '#/types';
import { toPhotoItem } from '#/utils';

type AlbumPhotoListProps = {
  album: Album;
  photos: AlbumPhoto[];
  selectedPhotoId: string | null;
  onSelectPhoto: (id: string) => void;
  onRatePhoto?: (photoId: string, rating: PhotoRating) => void;
};

export const AlbumPhotoList = ({
  album,
  photos,
  selectedPhotoId,
  onSelectPhoto,
  onRatePhoto
}: AlbumPhotoListProps) => {
  const { ref, isDropTarget } = useDroppable({
    id: album.id,
    data: { albumId: album.id }
  });

  return (
    <MediaPhotoListShell
      rows={photos}
      getRowKey={(photo) => photo.id}
      emptyMessage="No photos in this album."
      droppable={{ ref, isDropTarget }}
      columns={onRatePhoto ? ALBUM_FILE_LIST_COLUMNS : undefined}
      renderRow={(photo) => (
        <PhotoContextMenu albumId={album.id} photoId={photo.id} onSelectPhoto={onSelectPhoto}>
          <MediaPhotoListRow
            photo={toPhotoItem(photo)}
            selected={photo.id === selectedPhotoId}
            dragId={`album-photo:${album.id}:${photo.id}`}
            dragData={{ photoId: photo.id, sourceAlbumId: album.id }}
            onSelectPhoto={onSelectPhoto}
            rating={photo.rating}
            onRatePhoto={onRatePhoto}
          />
        </PhotoContextMenu>
      )}
    />
  );
};
