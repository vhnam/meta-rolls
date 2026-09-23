import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useRef } from 'react';

import { Button } from '#/components/ui/button';
import { type Roll, isFrameEmpty } from '#/shared/rolls';
import { useRollsStore } from '#/stores/rolls.store';
import { readDragString } from '#/utils/common';

import { RollFrameTile } from './roll-frame-tile';

/** Number of columns the CSS grid currently lays out, read back so ↑/↓ can move by a row. */
const readColumnCount = (grid: HTMLElement | null) =>
  grid ? Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(' ').length) : 1;

export function RollFrameGrid({ roll, missingPaths }: { roll: Roll; missingPaths: Set<string> }) {
  const selectedFrameIds = useRollsStore((state) => state.selectedFrameIds);
  const selectFrame = useRollsStore((state) => state.selectFrame);
  const addFrame = useRollsStore((state) => state.addFrame);
  const removeLastFrame = useRollsStore((state) => state.removeLastFrame);
  const moveFrameScan = useRollsStore((state) => state.moveFrameScan);
  const gridRef = useRef<HTMLDivElement>(null);

  // Dragging a scan onto another frame moves it there (or swaps, if that frame has one).
  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) {
      return;
    }
    const from = readDragString(event.operation.source?.data, 'frameId');
    const to = readDragString(event.operation.target?.data, 'frameId');
    if (from && to && from !== to) {
      void moveFrameScan(from, to);
    }
  };

  const orderedIds = roll.frames.map((frame) => frame.id);
  const lastFrame = roll.frames[roll.frames.length - 1];
  const canRemoveLast = lastFrame !== undefined && isFrameEmpty(lastFrame);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const step =
      event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowLeft'
          ? -1
          : event.key === 'ArrowDown'
            ? readColumnCount(gridRef.current)
            : event.key === 'ArrowUp'
              ? -readColumnCount(gridRef.current)
              : 0;
    if (step === 0 || orderedIds.length === 0) {
      return;
    }
    event.preventDefault();
    const current = orderedIds.indexOf(selectedFrameIds[selectedFrameIds.length - 1] ?? '');
    const next = Math.min(orderedIds.length - 1, Math.max(0, current < 0 ? 0 : current + step));
    selectFrame(orderedIds[next], event.shiftKey ? 'range' : 'single', orderedIds);
    gridRef.current?.querySelector<HTMLElement>(`[data-frame-id="${orderedIds[next]}"]`)?.focus();
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium">Frames</h3>
        <div className="flex items-center gap-1">
          <Button size="xs" variant="outline" onClick={() => void addFrame(roll.id)}>
            <IconPlus /> Add frame
          </Button>
          <Button
            size="xs"
            variant="outline"
            disabled={!canRemoveLast}
            onClick={() => void removeLastFrame(roll.id)}
          >
            <IconMinus /> Remove last
          </Button>
        </div>
      </div>
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div
          ref={gridRef}
          role="listbox"
          aria-multiselectable
          aria-label="Frames"
          onKeyDown={handleKeyDown}
          className="grid grid-cols-[repeat(auto-fill,minmax(4rem,1fr))] gap-1"
        >
          {roll.frames.map((frame) => (
            <RollFrameTile
              key={frame.id}
              frame={frame}
              selected={selectedFrameIds.includes(frame.id)}
              missing={frame.scanPath !== null && missingPaths.has(frame.scanPath)}
              onClick={(event) =>
                selectFrame(
                  frame.id,
                  event.shiftKey ? 'range' : event.metaKey || event.ctrlKey ? 'toggle' : 'single',
                  orderedIds
                )
              }
            />
          ))}
        </div>
      </DragDropProvider>
    </section>
  );
}
