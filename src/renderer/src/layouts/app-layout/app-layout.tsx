import { Outlet } from '@tanstack/react-router';

import { AppTitleBar } from '#/components/app-title-bar';
import { TooltipProvider } from '#/components/ui/tooltip';

const AppLayout = () => {
  return (
    <TooltipProvider>
      <div className="flex h-svh flex-col overflow-hidden">
        <main className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </main>
        <AppTitleBar />
      </div>
    </TooltipProvider>
  );
};

export default AppLayout;
