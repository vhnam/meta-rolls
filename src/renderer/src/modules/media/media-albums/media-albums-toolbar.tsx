import {
  IconLayoutGrid,
  IconLayoutGridFilled,
  IconLayoutList,
  IconLayoutListFilled,
  IconLayoutSidebar,
  IconLayoutSidebarFilled
} from '@tabler/icons-react';

import { Button } from '#/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { type MediaView } from '#/types';

type MediaAlbumsToolbarProps = {
  view: MediaView;
  zoom: number;
  folderTreeCollapsed: boolean;
  onViewChange: (view: MediaView) => void;
  onZoomChange: (value: number) => void;
  onToggleFolderTree: () => void;
};

export const MediaAlbumsToolbar = ({
  view,
  zoom,
  folderTreeCollapsed,
  onViewChange,
  onZoomChange,
  onToggleFolderTree
}: MediaAlbumsToolbarProps) => {
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
      <span className="min-w-0 flex-1 truncate px-2 text-[11px] font-medium text-foreground">
        Albums
      </span>

      <div className="ml-auto flex items-center gap-1">
        {view === 'grid' && (
          <div className="flex items-center gap-2 pr-1">
            <input
              type="range"
              min={0}
              max={100}
              step={25}
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
                variant={view === 'grid' ? 'secondary' : 'ghost'}
                size="icon-xs"
                onClick={() => onViewChange('grid')}
              />
            }
          >
            {view === 'grid' ? <IconLayoutGridFilled /> : <IconLayoutGrid />}
          </TooltipTrigger>
          <TooltipContent>
            <p>Thumbnail view</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
