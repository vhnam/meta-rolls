import '#/styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { router } from '#/router';
import { hydrateSettingsStore } from '#/stores/settings.store';

const bootstrap = async () => {
  await hydrateSettingsStore();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
};

void bootstrap();
