import { IconStarFilled } from '@tabler/icons-react';
import { memo } from 'react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger
} from '#/components/ui/context-menu';
import { type PhotoRating, type PhotoRotateDirection } from '#/types';

const PREVIEW_RATING_STARS = [1, 2, 3, 4, 5] as const;
const rotateShortcutMod = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl+';

type PhotoPreviewImageProps = {
  src: string;
  name: string;
  onImage: (node: HTMLImageElement | null) => void;
  onLoad: (src: string) => void;
  onError: (src: string) => void;
  onRatePhoto?: (rating: PhotoRating) => void;
  onRotatePhoto?: (direction: PhotoRotateDirection) => void;
};

export const PhotoPreviewImage = memo(function PhotoPreviewImage({
  src,
  name,
  onImage,
  onLoad,
  onError,
  onRatePhoto,
  onRotatePhoto
}: PhotoPreviewImageProps) {
  const canRate = onRatePhoto !== undefined;

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <img
            ref={onImage}
            src={src}
            alt={name}
            draggable={false}
            className="max-h-full max-w-full translate-z-0 will-change-transform select-none object-contain"
            onLoad={() => onLoad(src)}
            onError={() => onError(src)}
          />
        }
      />
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuItem disabled={!canRate} onClick={() => onRatePhoto?.(0)}>
            No rating
          </ContextMenuItem>
          {PREVIEW_RATING_STARS.map((stars) => (
            <ContextMenuItem key={stars} disabled={!canRate} onClick={() => onRatePhoto?.(stars)}>
              {Array.from({ length: stars }, (_, index) => (
                <IconStarFilled key={index} className="size-3" stroke={1.5} />
              ))}
            </ContextMenuItem>
          ))}
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem disabled={!onRotatePhoto} onClick={() => onRotatePhoto?.('cw')}>
            Rotate 90° Clockwise
            <ContextMenuShortcut className="pl-4">{rotateShortcutMod}&#93;</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled={!onRotatePhoto} onClick={() => onRotatePhoto?.('ccw')}>
            Rotate 90° Counterclockwise
            <ContextMenuShortcut className="pl-4">{rotateShortcutMod}&#91;</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
});
