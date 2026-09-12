import { Outlet } from '@tanstack/react-router';

import { AppTitleBar } from '#/components/app-title-bar';
import { Toaster } from '#/components/ui/toast';
import { TooltipProvider } from '#/components/ui/tooltip';
import { useThemeSync } from '#/hooks/use-theme';
import { PreferencesDialog } from '#/modules/preferences/preferences-dialog';

const AppLayout = () => {
  useThemeSync();

  return (
    <TooltipProvider>
      <div className="flex h-svh flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </main>
        <AppTitleBar />
        <PreferencesDialog />
      </div>
      <Toaster />
    </TooltipProvider>
  );
};

export default AppLayout;
