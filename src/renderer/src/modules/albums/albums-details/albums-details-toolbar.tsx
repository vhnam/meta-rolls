import {
  IconLayoutGrid,
  IconLayoutGridFilled,
  IconLayoutList,
  IconLayoutListFilled
} from '@tabler/icons-react';

import { Button } from '#/components/ui/button';
import { Separator } from '#/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { Album, type MediaView } from '#/types';

type AlbumsDetailsToolbarProps = {
  view: MediaView;
  zoom: number;
  album: Album | undefined;
  onViewChange: (view: MediaView) => void;
  onZoomChange: (value: number) => void;
};

export const AlbumsDetailsToolbar = ({
  view,
  zoom,
  album,
  onViewChange,
  onZoomChange
}: AlbumsDetailsToolbarProps) => {
  return (
    <div className="flex h-7 shrink-0 items-center gap-0.5 border-b border-border bg-muted px-1 text-muted-foreground">
      <span className="min-w-0 flex-1 truncate px-2 text-tiny font-medium text-foreground">
        {album?.name ?? 'Albums'}
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

            <Separator orientation="vertical" className="h-6" />
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
      </div>
    </div>
  );
};
