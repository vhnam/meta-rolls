import { createFileRoute } from '@tanstack/react-router';

import { CullScreen } from '#/modules/cull/cull-screen';

export const Route = createFileRoute('/cull')({
  component: CullScreen
});
