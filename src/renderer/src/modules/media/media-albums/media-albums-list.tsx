import { useDroppable } from '@dnd-kit/react';

import { MediaPhotoListRow, MediaPhotoListShell } from '#/components/media-photo-list';
import { type Album, type AlbumPhoto } from '#/types';
import { toPhotoItem } from '#/utils';

import { MediaAlbumsPhotoContextMenu } from './media-albums-photo-context-menu';

type MediaAlbumsListProps = {
  album: Album;
  photos: AlbumPhoto[];
  selectedPhotoId: string | null;
  onSelectPhoto: (id: string) => void;
};

export const MediaAlbumsList = ({
  album,
  photos,
  selectedPhotoId,
  onSelectPhoto
}: MediaAlbumsListProps) => {
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
      renderRow={(photo) => (
        <MediaAlbumsPhotoContextMenu
          albumId={album.id}
          photoId={photo.id}
          onSelectPhoto={onSelectPhoto}
        >
          <MediaPhotoListRow
            photo={toPhotoItem(photo)}
            selected={photo.id === selectedPhotoId}
            dragId={`album-photo:${album.id}:${photo.id}`}
            dragData={{ photoId: photo.id, sourceAlbumId: album.id }}
            onSelectPhoto={onSelectPhoto}
          />
        </MediaAlbumsPhotoContextMenu>
      )}
    />
  );
};
