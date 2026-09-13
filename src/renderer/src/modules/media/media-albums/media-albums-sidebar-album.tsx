import { useDroppable } from '@dnd-kit/react';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { cn } from 'cn';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '#/components/ui/context-menu';
import { type Album } from '#/types';

type MediaAlbumsSidebarAlbumProps = {
  album: Album;
  selected: boolean;
  onSelect: (id: string) => void;
  onRenameAlbum: (album: Album) => void;
  onRemoveAlbum: (id: string) => void;
};

export const MediaAlbumsSidebarAlbum = ({
  album,
  selected,
  onSelect,
  onRenameAlbum,
  onRemoveAlbum
}: MediaAlbumsSidebarAlbumProps) => {
  const { ref, isDropTarget } = useDroppable({
    id: `album-sidebar:${album.id}`,
    data: { albumId: album.id }
  });

  return (
    <div
      ref={ref}
      className={cn(isDropTarget && 'bg-accent/40 outline outline-primary -outline-offset-2')}
    >
      <ContextMenu>
        <ContextMenuTrigger
          render={
            <button
              type="button"
              className={cn(
                'flex h-6 w-full items-center px-3 text-left text-tiny text-sidebar-foreground hover:bg-sidebar-accent',
                selected
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:text-sidebar-foreground'
              )}
              onClick={() => onSelect(album.id)}
            />
          }
        >
          {album.name}
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onRenameAlbum(album)}>
            <IconEdit />
            Rename album
          </ContextMenuItem>
          <ContextMenuItem variant="destructive" onClick={() => void onRemoveAlbum(album.id)}>
            <IconTrash />
            Remove album
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
};
