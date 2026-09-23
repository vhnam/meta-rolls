import { createFileRoute, redirect } from '@tanstack/react-router';

import { RollsScreen } from '#/modules/rolls/rolls-screen';
import { useSettingsStore } from '#/stores/settings.store';

export const Route = createFileRoute('/rolls')({
  // Settings are hydrated before the router mounts, so this is safe to read synchronously.
  beforeLoad: () => {
    if (!useSettingsStore.getState().rollsEnabled) {
      throw redirect({ to: '/media' });
    }
  },
  component: RollsScreen
});
