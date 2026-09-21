import { CollisionPriority } from '@dnd-kit/abstract';
import { pointerIntersection } from '@dnd-kit/collision';
import { useDraggable, useDroppable } from '@dnd-kit/react';
import { IconPhoto, IconRotate2, IconRotateClockwise, IconTrash } from '@tabler/icons-react';
import { type CSSProperties } from 'react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '#/components/ui/context-menu';
import { slotImageLayout } from '#/shared/print';
import {
  type InstaxPrintFormat,
  type PhotoItem,
  type PhotoRotateDirection,
  type SlotFit
} from '#/types';
import { cn } from '#/utils/common';
import { getInstaxCardGeometry, toMediaFileUrl } from '#/utils/photo';

type DeliverCanvasSlotProps = {
  slotId: string;
  photo: PhotoItem | null;
  fit: SlotFit;
  format: InstaxPrintFormat;
  cardHeightPx: number;
  rotationDeg?: number;
  imageRotationDeg?: number;
  isSelected: boolean;
  onSelect: (slotId: string) => void;
  onRotateImage: (slotId: string, direction: PhotoRotateDirection) => void;
  onRemoveFromCanvas: (slotId: string) => void;
};

export const deliverSlotPhotoStyle = (
  windowWidth: number,
  windowHeight: number,
  imageRotationDeg: number,
  fit: SlotFit
): CSSProperties => {
  const layout = slotImageLayout(windowWidth, windowHeight, imageRotationDeg);
  return {
    width: layout.width,
    height: layout.height,
    transform: `translate(-50%, -50%) rotate(${layout.rotationDeg}deg)`,
    objectFit: fit
  };
};

export function DeliverCanvasSlot({
  slotId,
  photo,
  fit,
  format,
  cardHeightPx,
  rotationDeg = 0,
  imageRotationDeg = 0,
  isSelected,
  onSelect,
  onRotateImage,
  onRemoveFromCanvas
}: DeliverCanvasSlotProps) {
  const { ref: dragRef, isDragging } = useDraggable({
    id: `deliver-slot-drag:${slotId}`,
    data: { slotId },
    disabled: !photo
  });
  const { ref: dropRef, isDropTarget } = useDroppable({
    id: `deliver-slot-drop:${slotId}`,
    data: { slotId },
    collisionDetector: pointerIntersection,
    collisionPriority: CollisionPriority.High
  });
  const src = photo?.path ? toMediaFileUrl(photo.path) : null;
  const setRefs = (element: Element | null) => {
    dragRef(element);
    dropRef(element);
  };
  const { cardWidthPx, imageWidthPx, imageHeightPx, topPx, sidePx } = getInstaxCardGeometry(
    format,
    cardHeightPx
  );
  const content = isDragging ? (
    <span className="text-tiny text-muted-foreground">Empty</span>
  ) : src ? (
    <img
      src={src}
      alt={photo?.name}
      draggable={false}
      className="absolute top-1/2 left-1/2 max-w-none select-none"
      style={deliverSlotPhotoStyle(imageWidthPx, imageHeightPx, imageRotationDeg, fit)}
    />
  ) : (
    <IconPhoto className="size-6 text-muted-foreground/40" />
  );

  // The whole print (border + photo) rotates as one rigid piece, so the
  // wrapper reserves the rotated (landscape) footprint in the page's layout.
  const isQuarterTurn = rotationDeg % 180 !== 0;
  const wrapperWidth = isQuarterTurn ? cardHeightPx : cardWidthPx;
  const wrapperHeight = isQuarterTurn ? cardWidthPx : cardHeightPx;

  const slot = (
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

  if (!photo) {
    return slot;
  }

  return (
    <ContextMenu
      onOpenChange={(open) => {
        if (open) {
          onSelect(slotId);
        }
      }}
    >
      <ContextMenuTrigger render={<div className="contents" />}>{slot}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => onRotateImage(slotId, 'cw')}>
            <IconRotateClockwise />
            Rotate clockwise
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onRotateImage(slotId, 'ccw')}>
            <IconRotate2 />
            Rotate counterclockwise
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onClick={() => onRemoveFromCanvas(slotId)}>
          <IconTrash />
          Remove from canvas
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
