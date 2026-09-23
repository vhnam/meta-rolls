import { useDroppable } from '@dnd-kit/react';

import { PhotoContextMenu } from '#/components/photo-context-menu';
import { PhotoListRow, PhotoListShell } from '#/components/photo-list';
import { ALBUM_FILE_LIST_COLUMNS } from '#/constants/media';
import { type Album, type AlbumPhoto, type PhotoRating } from '#/types';
import { toPhotoItem } from '#/utils';

type AlbumPhotoListProps = {
  album: Album;
  photos: AlbumPhoto[];
  selectedPhotoId: string | null;
  placedPhotoIds?: ReadonlySet<string>;
  onSelectPhoto: (id: string) => void;
  onRatePhoto?: (photoId: string, rating: PhotoRating) => void;
};

export function AlbumPhotoList({
  album,
  photos,
  selectedPhotoId,
  placedPhotoIds,
  onSelectPhoto,
  onRatePhoto
}: AlbumPhotoListProps) {
  const { ref, isDropTarget } = useDroppable({
    id: album.id,
    data: { albumId: album.id }
  });

  return (
    <PhotoListShell
      rows={photos}
      getRowKey={(photo) => photo.id}
      emptyMessage="No photos in this album."
      droppable={{ ref, isDropTarget }}
      columns={onRatePhoto ? ALBUM_FILE_LIST_COLUMNS : undefined}
      renderRow={(photo) => (
        <PhotoContextMenu albumId={album.id} photoId={photo.id} onSelectPhoto={onSelectPhoto}>
          <PhotoListRow
            photo={toPhotoItem(photo)}
            selected={photo.id === selectedPhotoId}
            placed={placedPhotoIds?.has(photo.id)}
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
}
