import {
  IconChevronLeft,
  IconChevronRight,
  IconDots,
  IconLayoutGrid,
  IconLayoutGridFilled,
  IconLayoutList,
  IconLayoutListFilled,
  IconLayoutSidebar,
  IconLayoutSidebarFilled,
  IconRefresh
} from '@tabler/icons-react';

import { Button } from '#/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '#/components/ui/dropdown-menu';
import { Separator } from '#/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { type MediaView } from '#/types';

type MediaBrowserToolbarProps = {
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

export const MediaBrowserToolbar = ({
  view,
  zoom,
  folderTreeCollapsed,
  currentFolderName,
  canGoBack,
  canGoForward,
  onViewChange,
  onZoomChange,
  onToggleFolderTree,
  onBack,
  onForward,
  onRefresh
}: MediaBrowserToolbarProps) => {
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
        <TooltipContent>{folderTreeCollapsed ? 'Show panel' : 'Hide panel'}</TooltipContent>
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

      <Separator orientation="vertical" className="mx-1 h-8 self-center" />

      <span className="min-w-0 flex-1 truncate px-2 text-[11px] font-medium text-foreground">
        {currentFolderName}
      </span>

      <div className="ml-auto flex items-center gap-1">
        {view === 'thumbnail' && (
          <div className="flex items-center gap-2 pr-1">
            <input
              type="range"
              min={0}
              max={100}
              value={zoom}
              onChange={(event) => onZoomChange(Number(event.target.value))}
              className="h-1 w-24 cursor-pointer accent-muted-foreground"
              aria-label="Thumbnail size"
            />
          </div>
        )}

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant={view === 'list' ? 'secondary' : 'ghost'}
                size="icon-xs"
                onClick={() => onViewChange('list')}
              />
            }
          >
            {view === 'list' ? <IconLayoutListFilled /> : <IconLayoutList />}
          </TooltipTrigger>
          <TooltipContent>
            <p>List view</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant={view === 'thumbnail' ? 'secondary' : 'ghost'}
                size="icon-xs"
                onClick={() => onViewChange('thumbnail')}
              />
            }
          >
            {view === 'thumbnail' ? <IconLayoutGridFilled /> : <IconLayoutGrid />}
          </TooltipTrigger>
          <TooltipContent>
            <p>Thumbnail view</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" />}>
            <IconDots />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onRefresh}>
                <IconRefresh />
                <span>Refresh</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
