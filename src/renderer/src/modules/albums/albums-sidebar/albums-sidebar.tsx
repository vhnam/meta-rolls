import { Button } from '#/components/ui/button';
import { IconPlus } from '@tabler/icons-react';

const AlbumSidebar = () => {
  return (
    <div className="w-64 py-2 px-4 bg-sidebar">
      <div className="w-full flex items-center justify-between">
        <h1 className="text-lg font-semibold">Albums</h1>
        <Button size="sm">
          <IconPlus className="size-4" />
          New
        </Button>
      </div>
    </div>
  );
};

export default AlbumSidebar;
