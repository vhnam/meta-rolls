import { AlbumsScreen } from '#/modules/albums/albums-screen';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/albums')({
  component: AlbumsScreen
});
