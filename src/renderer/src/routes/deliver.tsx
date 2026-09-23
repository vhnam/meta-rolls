import { createFileRoute } from '@tanstack/react-router';

import { DeliverScreen } from '#/modules/deliver/deliver-screen';

export const Route = createFileRoute('/deliver')({
  component: DeliverScreen
});
