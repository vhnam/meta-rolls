import { IconLibraryPhoto, IconPhoto, IconPhotoAlt } from '@tabler/icons-react';
import { useNavigate, useRouterState } from '@tanstack/react-router';

import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs';
import appIcon from '@/resources/icon.png';

const TAB_ROUTES = {
  media: '/media',
  photos: '/photos',
  albums: '/albums'
} as const;

type TabValue = keyof typeof TAB_ROUTES;

const AppTitleBar = () => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const value: TabValue = pathname.startsWith('/albums')
    ? 'albums'
    : pathname.startsWith('/photos')
      ? 'photos'
      : 'media';

  const handleValueChange = (next: TabValue) => {
    if (!['media', 'photos', 'albums'].includes(next)) {
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
            <TabsTrigger value="photos">
              <IconPhoto className="size-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="albums">
              <IconLibraryPhoto className="size-4" />
              Albums
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div>&nbsp;</div>
      </div>
    </div>
  );
};

export default AppTitleBar;
