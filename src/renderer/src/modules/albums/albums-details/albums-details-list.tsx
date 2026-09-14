import { useDroppable } from '@dnd-kit/react';

import { MediaPhotoListRow, MediaPhotoListShell } from '#/components/media-photo-list';
import { type Album, type AlbumPhoto } from '#/types';
import { toPhotoItem } from '#/utils';

import { AlbumsDetailsPhotoContextMenu } from './albums-details-photo-context-menu';

type AlbumsDetailsListProps = {
  album: Album;
  photos: AlbumPhoto[];
  selectedPhotoId: string | null;
  onSelectPhoto: (id: string) => void;
};

export const AlbumsDetailsList = ({
  album,
  photos,
  selectedPhotoId,
  onSelectPhoto
}: AlbumsDetailsListProps) => {
  const { ref, isDropTarget } = useDroppable({
    id: album.id,
    data: { albumId: album.id }
  });

  return (
    <div className="h-full min-h-0">
      <MediaPhotoListShell
        rows={photos}
        getRowKey={(photo) => photo.id}
        emptyMessage="No photos in this album."
        droppable={{ ref, isDropTarget }}
        renderRow={(photo) => (
          <AlbumsDetailsPhotoContextMenu
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
          </AlbumsDetailsPhotoContextMenu>
        )}
      />
    </div>
  );
};
