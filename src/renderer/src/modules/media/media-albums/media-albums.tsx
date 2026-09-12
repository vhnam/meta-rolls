import { IconPlus } from '@tabler/icons-react';
import { cn } from 'cn';

import { Button } from '#/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { useAlbumStore } from '#/stores/album.store';

const MediaLibraries = () => {
  const albums = useAlbumStore((state) => state.albums);
  const selectedId = useAlbumStore((state) => state.activeAlbumId);
  const onSelect = useAlbumStore((state) => state.setActiveAlbumId);
  const addAlbum = useAlbumStore((state) => state.addAlbum);

  return (
    <aside className="flex min-h-0 w-52 shrink-0 flex-col border-inline-end border-sidebar-border bg-sidebar">
      <div className="flex h-7 items-center justify-between border-b border-sidebar-border bg-muted px-2">
        <span className="text-[11px] font-medium text-sidebar-foreground">Albums</span>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="New album"
                onClick={() => {
                  void addAlbum();
                }}
              />
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
        <div className="flex-1 scroll-fade overflow-auto py-1">
          {albums.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                'flex h-6 w-full items-center px-3 text-left text-[11px] text-sidebar-foreground hover:bg-sidebar-accent',
                selectedId === item.id && 'bg-sidebar-accent text-sidebar-accent-foreground'
              )}
              onClick={() => onSelect(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sidebar-foreground">
          <p className="text-xs text-muted-foreground">No albums found</p>
        </div>
      )}
    </aside>
  );
};

export default MediaLibraries;
