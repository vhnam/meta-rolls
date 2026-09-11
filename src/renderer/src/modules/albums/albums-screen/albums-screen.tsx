import { AlbumSidebar } from '#/modules/albums/albums-sidebar';
import { useAlbumStore } from '#/stores/album.store';

const AlbumsScreen = () => {
  const albums = useAlbumStore((state) => state.albums);
  const activeAlbumId = useAlbumStore((state) => state.activeAlbumId);
  const currentPage = useAlbumStore((state) => state.currentPage);
  const activeAlbum = albums.find((album) => album.id === activeAlbumId);

  return (
    <div className="flex min-h-0 flex-1">
      <AlbumSidebar />
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        {activeAlbum ? `${activeAlbum.name} · page ${currentPage}` : 'Select or create an album'}
      </div>
    </div>
  );
};

export default AlbumsScreen;
