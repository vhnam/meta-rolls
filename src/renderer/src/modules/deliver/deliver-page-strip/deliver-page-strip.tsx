import { IconPlus } from '@tabler/icons-react';

import { useCanvasStore } from '#/stores/canvas.store';
import { cn } from '#/utils/common';

export function DeliverPageStrip() {
  const spreadPhotoIds = useCanvasStore((state) => state.spreadPhotoIds);
  const activeSpreadIndex = useCanvasStore((state) => state.activeSpreadIndex);
  const setActiveSpreadIndex = useCanvasStore((state) => state.setActiveSpreadIndex);
  const addSpread = useCanvasStore((state) => state.addSpread);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto bg-sidebar p-2">
      {spreadPhotoIds.map((slots, spreadIndex) => (
        <button
          key={spreadIndex}
          type="button"
          onClick={() => setActiveSpreadIndex(spreadIndex)}
          className={cn(
            'relative flex flex-col items-center gap-1 rounded-sm border p-1.5 transition-colors',
            spreadIndex === activeSpreadIndex
              ? 'border-primary bg-primary/10'
              : 'border-transparent hover:border-border hover:bg-sidebar-accent'
          )}
        >
          {spreadIndex === activeSpreadIndex ? (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 animate-in rounded-sm zoom-in-95 ring-2 ring-primary/60 duration-300 fade-in-0"
            />
          ) : null}
          <div className="flex gap-0.5">
            {[0, 1].map((pageIndex) => (
              <div key={pageIndex} className="flex flex-col gap-0.5">
                {[0, 1].map((rowIndex) => {
                  const slotIndex = pageIndex * 2 + rowIndex;
                  return (
                    <span
                      key={rowIndex}
                      className={cn(
                        'h-4 w-6 rounded-xs border',
                        slots[slotIndex]
                          ? 'border-primary/60 bg-primary/60'
                          : 'border-muted-foreground/30 bg-muted'
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <span className="text-tiny text-muted-foreground">Spread {spreadIndex + 1}</span>
        </button>
      ))}

      <button
        type="button"
        onClick={addSpread}
        className="flex flex-col items-center gap-1 rounded-sm border border-dashed border-muted-foreground/40 p-1.5 text-muted-foreground hover:bg-sidebar-accent"
      >
        <IconPlus className="size-4" />
        <span className="text-tiny">Add page</span>
      </button>
    </div>
  );
}
