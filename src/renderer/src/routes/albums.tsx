import { createFileRoute } from '@tanstack/react-router';

import { AlbumsScreen } from '#/modules/albums/albums-screen';

export const Route = createFileRoute('/albums')({
  component: AlbumsScreen
});
