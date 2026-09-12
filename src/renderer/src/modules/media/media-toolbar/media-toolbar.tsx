import {
  IconChevronLeft,
  IconChevronRight,
  IconDots,
  IconLayoutGrid,
  IconLayoutList,
  IconLayoutSidebar,
  IconLayoutSidebarFilled,
  IconRefresh
  // IconSearch
} from '@tabler/icons-react';

import { Button } from '#/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '#/components/ui/dropdown-menu';
// import { Input } from '#/components/ui/input';
import { Separator } from '#/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { type MediaView } from '#/types';

type MediaToolbarProps = {
  query: string;
  view: MediaView;
  zoom: number;
  folderTreeCollapsed: boolean;
  currentFolderName: string;
  canGoBack: boolean;
  canGoForward: boolean;
  onQueryChange: (value: string) => void;
  onViewChange: (view: MediaView) => void;
  onZoomChange: (value: number) => void;
  onToggleFolderTree: () => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
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
  currentFolderName,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onRefresh
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
        <TooltipTrigger
          render={<Button variant="ghost" size="icon-xs" disabled={!canGoBack} onClick={onBack} />}
        >
          <IconChevronLeft />
        </TooltipTrigger>
        <TooltipContent>Back</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="ghost" size="icon-xs" disabled={!canGoForward} onClick={onForward} />
          }
        >
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
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" />}>
            <IconDots />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onRefresh}>
                <IconRefresh />
                <span>Refresh</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
