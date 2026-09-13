import { IconPhotoAlt } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';

import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs';
import appIcon from '@/resources/icon.png';

const TAB_ROUTES = {
  media: '/media'
} as const;

type TabValue = keyof typeof TAB_ROUTES;

const AppTitleBar = () => {
  const navigate = useNavigate();
  const value: TabValue = 'media';

  const handleValueChange = (next: TabValue) => {
    if (!['media'].includes(next)) {
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
          </TabsList>
        </Tabs>
        <div>&nbsp;</div>
      </div>
    </div>
  );
};

export default AppTitleBar;
