import { Button } from '#/components/ui/button';
import { cn } from '#/lib/utils';
import { useAlbumStore } from '#/stores/album.store';
import { IconPlus } from '@tabler/icons-react';

const AlbumSidebar = () => {
  const albums = useAlbumStore((state) => state.albums);
  const activeAlbumId = useAlbumStore((state) => state.activeAlbumId);
  const addAlbum = useAlbumStore((state) => state.addAlbum);
  const setActiveAlbumId = useAlbumStore((state) => state.setActiveAlbumId);

  return (
    <div className="w-64 bg-sidebar px-4 py-2">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-lg font-semibold">Albums</h1>
        <Button size="sm" onClick={() => addAlbum()}>
          <IconPlus className="size-4" />
          New
        </Button>
      </div>
      <div className="mt-3 flex flex-col gap-0.5">
        {albums.length === 0 ? (
          <p className="text-xs text-muted-foreground">No albums yet.</p>
        ) : (
          albums.map((album) => (
            <button
              key={album.id}
              type="button"
              className={cn(
                'h-7 rounded-md px-2 text-left text-sm hover:bg-sidebar-accent',
                activeAlbumId === album.id && 'bg-sidebar-accent text-sidebar-accent-foreground'
              )}
              onClick={() => setActiveAlbumId(album.id)}
            >
              {album.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default AlbumSidebar;
