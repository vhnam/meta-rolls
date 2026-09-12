import { createFileRoute } from '@tanstack/react-router';

import { MediaScreen } from '#/modules/media/media-screen';

export const Route = createFileRoute('/media')({
  component: MediaScreen
});
