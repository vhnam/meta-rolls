import { IconPhotoOff, IconTrash } from '@tabler/icons-react';
import { type PropsWithChildren } from 'react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '#/components/ui/context-menu';
import { useAlbumStore } from '#/stores/album.store';
import { useCanvasStore } from '#/stores/canvas.store';

type PhotoContextMenuProps = PropsWithChildren & {
  albumId: string;
  photoId: string;
  onSelectPhoto: (id: string) => void;
};

export function PhotoContextMenu({
  albumId,
  photoId,
  onSelectPhoto,
  children
}: PhotoContextMenuProps) {
  const removePhotoFromAlbum = useAlbumStore((state) => state.removePhotoFromAlbum);
  const isOnCanvas = useCanvasStore((state) =>
    state.spreadPhotoIds.some((slots) => slots.includes(photoId))
  );
  const removePhotoFromCanvas = useCanvasStore((state) => state.removePhotoFromCanvas);

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
        {isOnCanvas ? (
          <>
            <ContextMenuItem onClick={() => removePhotoFromCanvas(photoId)}>
              <IconPhotoOff />
              Remove from canvas
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        ) : null}
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
}
