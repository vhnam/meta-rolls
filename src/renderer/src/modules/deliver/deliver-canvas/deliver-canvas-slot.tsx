import { useDraggable, useDroppable } from '@dnd-kit/react';
import { IconPhoto } from '@tabler/icons-react';

import { type InstaxPrintFormat, type PhotoItem, type SlotFit } from '#/types';
import { cn } from '#/utils/common';
import { getInstaxCardGeometry, toMediaFileUrl } from '#/utils/photo';

type DeliverCanvasSlotProps = {
  slotId: string;
  photo: PhotoItem | null;
  fit: SlotFit;
  format: InstaxPrintFormat;
  cardHeightPx: number;
  rotationDeg?: number;
  isSelected: boolean;
  onSelect: (slotId: string) => void;
};

export function DeliverCanvasSlot({
  slotId,
  photo,
  fit,
  format,
  cardHeightPx,
  rotationDeg = 0,
  isSelected,
  onSelect
}: DeliverCanvasSlotProps) {
  const { ref: dragRef, isDragging } = useDraggable({
    id: `deliver-slot-drag:${slotId}`,
    data: { slotId },
    disabled: !photo
  });
  const { ref: dropRef, isDropTarget } = useDroppable({
    id: `deliver-slot-drop:${slotId}`,
    data: { slotId }
  });
  const src = photo?.path ? toMediaFileUrl(photo.path) : null;
  const setRefs = (element: Element | null) => {
    dragRef(element);
    dropRef(element);
  };
  const content = isDragging ? (
    <span className="text-tiny text-muted-foreground">Empty</span>
  ) : src ? (
    <img
      src={src}
      alt={photo?.name}
      draggable={false}
      className="h-full w-full select-none"
      style={{ objectFit: fit }}
    />
  ) : (
    <IconPhoto className="size-6 text-muted-foreground/40" />
  );

  const { cardWidthPx, imageWidthPx, imageHeightPx, topPx, sidePx } = getInstaxCardGeometry(
    format,
    cardHeightPx
  );
  // The whole print (border + photo) rotates as one rigid piece, so the
  // wrapper reserves the rotated (landscape) footprint in the page's layout.
  const isQuarterTurn = rotationDeg % 180 !== 0;
  const wrapperWidth = isQuarterTurn ? cardHeightPx : cardWidthPx;
  const wrapperHeight = isQuarterTurn ? cardWidthPx : cardHeightPx;

  return (
    <div className="relative shrink-0" style={{ width: wrapperWidth, height: wrapperHeight }}>
      <button
        ref={setRefs}
        type="button"
        onClick={photo ? () => onSelect(slotId) : undefined}
        aria-disabled={!photo}
        className={cn(
          'absolute top-1/2 left-1/2 border bg-white shadow-sm transition-colors dark:bg-neutral-100',
          photo ? 'cursor-pointer' : 'cursor-default',
          isSelected ? 'border-primary ring-2 ring-primary/50' : 'border-border/60',
          isDropTarget && !isDragging && 'outline outline-primary -outline-offset-2'
        )}
        style={{
          width: cardWidthPx,
          height: cardHeightPx,
          transform: `translate(-50%, -50%) rotate(${rotationDeg}deg)`
        }}
      >
        <div
          className={cn(
            'absolute flex items-center justify-center overflow-hidden bg-muted/15',
            isDragging && 'border border-dashed border-muted-foreground/40 bg-muted/40'
          )}
          style={{ top: topPx, left: sidePx, width: imageWidthPx, height: imageHeightPx }}
        >
          {content}
        </div>
      </button>
    </div>
  );
}
