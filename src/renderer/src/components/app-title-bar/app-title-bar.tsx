import { IconBook2, IconPhotoAlt, IconPhotoCheck } from '@tabler/icons-react';
import { useNavigate, useRouterState } from '@tanstack/react-router';

import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs';
import appIcon from '#/resources/icon.png';

const TAB_ROUTES = {
  media: '/media',
  cull: '/cull',
  deliver: '/deliver'
} as const;

type TabValue = keyof typeof TAB_ROUTES;

export default function AppTitleBar() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const value: TabValue = pathname.startsWith('/cull')
    ? 'cull'
    : pathname.startsWith('/deliver')
      ? 'deliver'
      : 'media';

  const handleValueChange = (next: TabValue) => {
    if (!['media', 'cull', 'deliver'].includes(next)) {
      return;
    }

    void navigate({ to: TAB_ROUTES[next] });
  };

  return (
    <div className="bg-accent shrink-0 border-t border-border">
      <div className="flex items-center justify-between w-full px-4">
        <div className="flex items-center gap-2">
          <img src={appIcon} alt="Meta Rolls" className="size-4 rounded-md" />
          <span className="text-xs font-semibold">Meta Rolls</span>
        </div>
        <Tabs value={value} onValueChange={handleValueChange}>
          <TabsList variant="line">
            <TabsTrigger value="media">
              <IconPhotoAlt className="size-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="cull">
              <IconPhotoCheck className="size-4" />
              Cull
            </TabsTrigger>
            <TabsTrigger value="deliver">
              <IconBook2 className="size-4" />
              Deliver
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div>&nbsp;</div>
      </div>
    </div>
  );
}
