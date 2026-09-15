import { IconTrash } from '@tabler/icons-react';
import { type PropsWithChildren } from 'react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '#/components/ui/context-menu';
import { useAlbumStore } from '#/stores/album.store';

type MediaAlbumsPhotoContextMenuProps = PropsWithChildren & {
  albumId: string;
  photoId: string;
  onSelectPhoto: (id: string) => void;
};

export const MediaAlbumsPhotoContextMenu = ({
  albumId,
  photoId,
  onSelectPhoto,
  children
}: MediaAlbumsPhotoContextMenuProps) => {
  const removePhotoFromAlbum = useAlbumStore((state) => state.removePhotoFromAlbum);

  return (
    <ContextMenu
      onOpenChange={(open) => {
        if (open) {
          onSelectPhoto(photoId);
        }
      }}
    >
      <ContextMenuTrigger render={<div className="contents" />}>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          variant="destructive"
          onClick={() => void removePhotoFromAlbum(albumId, photoId)}
        >
          <IconTrash />
          Remove from album
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
