import { IconPlus } from '@tabler/icons-react';

import { Button } from '#/components/ui/button';
import { ALBUM_LIBRARIES } from '#/constants/media';
import { cn } from '#/lib/utils';

type MediaLibrariesProps = {
  selectedId: string;
  onSelect: (id: string) => void;
};

const MediaLibraries = ({ selectedId, onSelect }: MediaLibrariesProps) => {
  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-7 items-center justify-between border-b border-sidebar-border bg-muted px-2">
        <span className="text-[11px] font-medium text-sidebar-foreground">Albums</span>
        <Button variant="ghost" size="icon-xs">
          <IconPlus />
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-1">
        {ALBUM_LIBRARIES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              'flex h-6 w-full items-center px-3 text-left text-[11px] text-sidebar-foreground hover:bg-sidebar-accent',
              selectedId === item.id && 'bg-sidebar-accent text-sidebar-accent-foreground'
            )}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default MediaLibraries;
