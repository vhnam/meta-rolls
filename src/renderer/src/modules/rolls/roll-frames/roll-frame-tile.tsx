import { useDraggable, useDroppable } from '@dnd-kit/react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';

import { type RollFrame, isFrameEmpty } from '#/shared/rolls';
import { getThumbnailRequestWidth, toMediaFileUrl } from '#/utils';
import { cn } from '#/utils/common';

type RollFrameTileProps = {
  frame: RollFrame;
  selected: boolean;
  /** The frame's linked file no longer exists on disk. */
  missing: boolean;
  onClick: (event: React.MouseEvent) => void;
};

export function RollFrameTile({ frame, selected, missing, onClick }: RollFrameTileProps) {
  const { ref: dragRef, isDragging } = useDraggable({
    id: `roll-frame-drag:${frame.id}`,
    data: { frameId: frame.id },
    disabled: !frame.scanPath
  });
  const { ref: dropRef, isDropTarget } = useDroppable({
    id: `roll-frame-drop:${frame.id}`,
    data: { frameId: frame.id }
  });
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const src =
    frame.scanPath && !missing
      ? toMediaFileUrl(frame.scanPath, undefined, getThumbnailRequestWidth())
      : null;
  const showImage = src !== null && failedSrc !== src;

  return (
    <button
      ref={(element) => {
        dragRef(element);
        dropRef(element);
      }}
      type="button"
      role="option"
      aria-selected={selected}
      data-frame-id={frame.id}
      onClick={onClick}
      className={cn(
        'relative flex aspect-3/2 items-center justify-center overflow-hidden border border-border bg-muted text-xs text-muted-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring',
        frame.blank && 'border-dashed opacity-60',
        selected && 'border-primary text-foreground',
        isDropTarget && 'ring-1 ring-primary',
        isDragging && 'opacity-40'
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={`Frame ${frame.number}`}
          draggable={false}
          className="size-full select-none object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span>{frame.number}</span>
      )}
      {showImage && (
        <span className="absolute bottom-0 left-0 bg-background/80 px-1 text-tiny leading-none text-foreground">
          {frame.number}
        </span>
      )}
      {(missing || (frame.scanPath && failedSrc === src)) && (
        <IconAlertTriangle
          aria-label="Scan file missing"
          className="absolute top-1 left-1 size-3.5 text-destructive"
        />
      )}
      {!isFrameEmpty(frame) && !frame.scanPath && (
        <span className="absolute top-1 right-1 size-1.5 rounded-full bg-primary" />
      )}
    </button>
  );
}
