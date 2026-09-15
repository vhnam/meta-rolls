import { IconPlus } from '@tabler/icons-react';

import { Button } from '#/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { cn } from '#/lib/utils';
import { type Album } from '#/types';

import { AlbumsSidebarAlbum } from './albums-sidebar-album';

type AlbumsSidebarProps = {
  albums: Album[];
  selectedId: string | null;
  collapsed?: boolean;
  onSelect: (id: string) => void;
  onAddAlbum: () => void;
  onRenameAlbum: (album: Album) => void;
  onRemoveAlbum: (id: string) => void;
};

export const AlbumsSidebar = ({
  albums,
  selectedId,
  collapsed = false,
  onSelect,
  onAddAlbum,
  onRenameAlbum,
  onRemoveAlbum
}: AlbumsSidebarProps) => {
  return (
    <aside
      className={cn(
        'flex min-h-0 min-w-0 flex-col border-r border-sidebar-border bg-sidebar',
        collapsed ? 'hidden' : 'h-full w-full'
      )}
    >
      <div className="flex h-7 shrink-0 items-center justify-end border-b border-border bg-sidebar-accent px-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-xs" aria-label="Add album" onClick={onAddAlbum} />
            }
          >
            <IconPlus />
          </TooltipTrigger>
          <TooltipContent>
            <p>Add album</p>
          </TooltipContent>
        </Tooltip>
      </div>
      {albums.length > 0 ? (
        <div className="min-h-0 flex-1 scroll-fade overflow-auto py-1">
          {albums.map((item) => (
            <AlbumsSidebarAlbum
              key={item.id}
              album={item}
              selected={selectedId === item.id}
              onSelect={onSelect}
              onRenameAlbum={onRenameAlbum}
              onRemoveAlbum={onRemoveAlbum}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-sidebar-foreground">
          <p className="text-xs text-muted-foreground">No albums found</p>
        </div>
      )}
    </aside>
  );
};
