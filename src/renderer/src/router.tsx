import { createHashHistory, createRouter } from '@tanstack/react-router';

import { AppErrorFallback } from '#/components/app-error-fallback';

import { routeTree } from './routeTree.gen';

const hashHistory = createHashHistory();

export const router = createRouter({
  routeTree,
  history: hashHistory,
  // Applies per-route (each unmatched-errorComponent route gets its own
  // catch boundary), so a crash in a screen replaces just that screen —
  // the title bar and preferences dialog, rendered by the root layout,
  // stay usable — while a crash in the root layout itself still falls
  // back to this same component.
  defaultErrorComponent: AppErrorFallback
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
