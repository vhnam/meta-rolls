import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { applyDocumentTheme } from '#/hooks/use-theme';
import { router } from '#/router';
import { hydrateAlbumStore } from '#/stores/album.store';
import { hydrateMediaPoolStore } from '#/stores/media-pool.store';
import { hydrateSettingsStore, useSettingsStore } from '#/stores/settings.store';

import '#/styles/global.css';

const bootstrap = async () => {
  await hydrateSettingsStore();
  await hydrateMediaPoolStore();
  await hydrateAlbumStore();
  applyDocumentTheme(useSettingsStore.getState().theme);

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
};

void bootstrap();
