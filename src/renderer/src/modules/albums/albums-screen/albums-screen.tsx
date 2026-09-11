import { AlbumSidebar } from '#/modules/albums/albums-sidebar';

const AlbumsScreen = () => {
  return (
    <div className="flex">
      <AlbumSidebar />
      <div className="flex-1">Content</div>
    </div>
  );
};

export default AlbumsScreen;
