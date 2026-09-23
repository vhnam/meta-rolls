import { createFileRoute } from '@tanstack/react-router';

import { RollsScreen } from '#/modules/rolls/rolls-screen';

export const Route = createFileRoute('/rolls')({
  component: RollsScreen
});
