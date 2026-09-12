import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { router } from '#/router';
import { hydrateSettingsStore } from '#/stores/settings.store';

import '#/styles/global.css';

const bootstrap = async () => {
  await hydrateSettingsStore();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
};

void bootstrap();
