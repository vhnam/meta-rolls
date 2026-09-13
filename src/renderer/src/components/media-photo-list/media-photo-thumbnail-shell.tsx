import { cn } from 'cn';
import { type CSSProperties, type ReactNode } from 'react';

import { THUMBNAIL_GRID_CLASS } from '#/constants/media';

type MediaPhotoThumbnailDroppable = {
  ref: (node: Element | null) => void;
  isDropTarget: boolean;
};

type MediaPhotoThumbnailShellProps = {
  isEmpty: boolean;
  emptyMessage: string;
  columns: number;
  droppable?: MediaPhotoThumbnailDroppable;
  children: ReactNode;
};

export const MediaPhotoThumbnailShell = ({
  isEmpty,
  emptyMessage,
  columns,
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

  return (
    <div
      ref={droppable?.ref}
      className={cn(
        'min-h-0 flex-1 scroll-fade overflow-auto p-3',
        droppable?.isDropTarget && 'bg-accent/40 outline outline-primary -outline-offset-2'
      )}
    >
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
    </div>
  );
};
