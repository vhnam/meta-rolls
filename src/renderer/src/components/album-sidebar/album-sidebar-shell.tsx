import { IconAlbum, IconPlus } from '@tabler/icons-react';

import { Button } from '#/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyMedia } from '#/components/ui/empty';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { type Album } from '#/types';
import { cn } from '#/utils/common';

import { AlbumSidebarRow } from './album-sidebar-row';

type AlbumSidebarShellProps = {
  albums: Album[];
  selectedId: string | null;
  collapsed?: boolean;
  title?: string;
  onSelect: (id: string) => void;
  onAddAlbum: () => void;
  onRenameAlbum: (album: Album) => void;
  onRemoveAlbum: (id: string) => void;
};

export function AlbumSidebarShell({
  albums,
  selectedId,
  collapsed = false,
  title,
  onSelect,
  onAddAlbum,
  onRenameAlbum,
  onRemoveAlbum
}: AlbumSidebarShellProps) {
  return (
    <aside
      className={cn(
        'flex min-h-0 min-w-0 flex-col border-r border-sidebar-border bg-sidebar',
        collapsed ? 'hidden' : 'h-full w-full'
      )}
    >
      <div className="flex h-7 shrink-0 items-center justify-between border-b border-border bg-sidebar-accent px-1">
        <div className="px-2 text-tiny font-medium">{title}</div>
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
            <AlbumSidebarRow
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
        <Empty className="flex-1">
          <EmptyMedia variant="icon">
            <IconAlbum />
          </EmptyMedia>
          <EmptyContent>
            <EmptyDescription>No albums found</EmptyDescription>
          </EmptyContent>
        </Empty>
      )}
    </aside>
  );
}
