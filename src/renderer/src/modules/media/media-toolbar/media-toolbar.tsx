import {
  IconChevronLeft,
  IconChevronRight,
  IconLayoutGrid,
  IconLayoutList,
  IconLayoutSidebar,
  IconLayoutSidebarFilled,
  // IconSearch
} from '@tabler/icons-react';
import { Button } from '#/components/ui/button';
// import { Input } from '#/components/ui/input';
import { Separator } from '#/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';

type MediaToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  view: 'list' | 'grid';
  onViewChange: (view: 'list' | 'grid') => void;
  zoom: number;
  onZoomChange: (value: number) => void;
  folderTreeCollapsed: boolean;
  onToggleFolderTree: () => void;
  currentFolderName: string;
};

const MediaToolbar = ({
  // query,
  // onQueryChange,
  view,
  onViewChange,
  // zoom,
  // onZoomChange,
  folderTreeCollapsed,
  onToggleFolderTree,
  currentFolderName
}: MediaToolbarProps) => {
  return (
    <div className="flex h-7 shrink-0 items-center gap-0.5 border-b border-border bg-muted px-1 text-muted-foreground">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant={folderTreeCollapsed ? 'ghost' : 'secondary'}
              size="icon-xs"
              aria-pressed={!folderTreeCollapsed}
              onClick={onToggleFolderTree}
            />
          }
        >
          {folderTreeCollapsed ? <IconLayoutSidebar /> : <IconLayoutSidebarFilled />}
        </TooltipTrigger>
        <TooltipContent>{folderTreeCollapsed ? 'Show disks' : 'Hide disks'}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<Button variant="ghost" size="icon-xs" />}>
          <IconChevronLeft />
        </TooltipTrigger>
        <TooltipContent>Back</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<Button variant="ghost" size="icon-xs" />}>
          <IconChevronRight />
        </TooltipTrigger>
        <TooltipContent>Forward</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 h-4 self-center" />

      <span className="min-w-0 flex-1 truncate px-2 text-[11px] font-medium text-foreground">
        {currentFolderName}
      </span>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant={view === 'list' ? 'secondary' : 'ghost'}
          size="icon-xs"
          onClick={() => onViewChange('list')}
        >
          <IconLayoutList />
        </Button>
        <Button
          variant={view === 'grid' ? 'secondary' : 'ghost'}
          size="icon-xs"
          onClick={() => onViewChange('grid')}
        >
          <IconLayoutGrid />
        </Button>
      </div>

      {/* <div className="relative mx-1 w-44">
        <IconSearch className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search"
          className="h-6 pl-7"
        />
      </div> */}

      {/* <div className="ml-auto flex items-center gap-2 pr-1">
        <input
          type="range"
          min={20}
          max={80}
          value={zoom}
          onChange={(event) => onZoomChange(Number(event.target.value))}
          className="h-1 w-24 cursor-pointer accent-primary"
          aria-label="Thumbnail size"
        />
        <span className="w-8 text-right font-mono text-tiny text-muted-foreground">{zoom}%</span>
      </div> */}
    </div>
  );
};

export default MediaToolbar;
