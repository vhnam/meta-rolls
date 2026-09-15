import type { CSSProperties, PropsWithChildren } from 'react';

import { THUMBNAIL_GRID_CLASS, THUMBNAIL_STRIP_CLASS } from '#/constants/media';
import { cn } from '#/lib/utils';

type MediaPhotoThumbnailDroppable = {
  ref: (node: Element | null) => void;
  isDropTarget: boolean;
};

type MediaPhotoThumbnailShellProps = PropsWithChildren & {
  isEmpty: boolean;
  emptyMessage: string;
  columns?: number;
  itemWidth?: number;
  layout?: 'grid' | 'row';
  droppable?: MediaPhotoThumbnailDroppable;
};

export const MediaPhotoThumbnailShell = ({
  isEmpty,
  emptyMessage,
  columns = 1,
  itemWidth,
  layout = 'grid',
  droppable,
  children
}: MediaPhotoThumbnailShellProps) => {
  if (isEmpty) {
    return (
      <div
        ref={droppable?.ref}
        className={cn(
          'flex-1 flex items-center justify-center text-sidebar-foreground',
          droppable?.isDropTarget && 'bg-accent/40 outline outline-primary -outline-offset-2'
        )}
      >
        <p className="text-xs text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const isRow = layout === 'row';

  return (
    <div
      ref={droppable?.ref}
      className={cn(
        'min-h-0 flex-1 scroll-fade p-3',
        isRow ? 'overflow-x-auto overflow-y-hidden' : 'overflow-auto',
        droppable?.isDropTarget && 'bg-accent/40 outline outline-primary -outline-offset-2'
      )}
    >
      {isRow ? (
        <div
          className={THUMBNAIL_STRIP_CLASS}
          style={{ '--thumb-width': `${itemWidth ?? 0}px` } as CSSProperties}
        >
          {children}
        </div>
      ) : (
        <div
          className={THUMBNAIL_GRID_CLASS}
          style={
            {
              '--zoom-cols': columns,
              gridTemplateColumns:
                'repeat(min(var(--thumb-fit-cols), var(--zoom-cols)), minmax(0, 1fr))'
            } as CSSProperties
          }
        >
          {children}
        </div>
      )}
    </div>
  );
};
