import { useVirtualizer } from '@tanstack/react-virtual';
import { type CSSProperties, type ReactNode, useRef, useState } from 'react';

import {
  FILE_LIST_COLUMNS,
  FILE_LIST_ROW_CLASS,
  FILE_LIST_ROW_HEIGHT,
  FILE_LIST_ROW_X_PADDING,
  type FileListColumn,
  type FileListColumnId
} from '#/constants/media';
import { cn } from '#/utils/common';

import { PhotoListHeader } from './photo-list-header';

type PhotoListDroppable = {
  ref: (node: Element | null) => void;
  isDropTarget: boolean;
};

type PhotoListShellProps<T> = {
  rows: T[];
  getRowKey: (row: T, index: number) => string | number;
  renderRow: (row: T, index: number) => ReactNode;
  emptyMessage: string;
  droppable?: PhotoListDroppable;
  columns?: readonly FileListColumn[];
};

const columnWidthsFrom = (columns: readonly FileListColumn[]) =>
  Object.fromEntries(columns.map((column) => [column.id, column.defaultWidth])) as Record<
    FileListColumnId,
    number
  >;

export function PhotoListShell<T>({
  rows,
  getRowKey,
  renderRow,
  emptyMessage,
  droppable,
  columns = FILE_LIST_COLUMNS
}: PhotoListShellProps<T>) {
  'use no memo';
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [columnWidths, setColumnWidths] = useState(() => columnWidthsFrom(columns));
  const columnSum = columns.reduce((sum, column) => sum + columnWidths[column.id], 0);
  const columnTemplate = columns
    .map((column) =>
      column.id === 'name'
        ? `minmax(${columnWidths[column.id]}px, 1fr)`
        : `${columnWidths[column.id]}px`
    )
    .join(' ');
  const columnStyle = {
    '--file-list-cols': columnTemplate,
    '--file-list-min-width': `${columnSum + FILE_LIST_ROW_X_PADDING}px`
  } as CSSProperties;
  // oxlint-disable-next-line react/incompatible-library -- TanStack Virtual is opted out via `use no memo`
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => FILE_LIST_ROW_HEIGHT,
    overscan: 12,
    getItemKey: (index) => getRowKey(rows[index], index)
  });

  return (
    <section
      className="flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden bg-background"
      style={columnStyle}
    >
      <div
        ref={headerRef}
        className="relative z-10 shrink-0 overflow-x-auto border-b border-border bg-muted scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        <PhotoListHeader
          columns={columns}
          widths={columnWidths}
          onResizeColumn={(id, width) =>
            setColumnWidths((current) => ({ ...current, [id]: width }))
          }
        />
      </div>
      <div
        ref={(node) => {
          scrollRef.current = node;
          droppable?.ref(node);
        }}
        className={cn(
          'min-h-0 flex-1 scroll-fade overflow-auto',
          droppable?.isDropTarget && 'bg-accent/40 outline outline-primary -outline-offset-2'
        )}
        onScroll={(event) => {
          if (headerRef.current) {
            headerRef.current.scrollLeft = event.currentTarget.scrollLeft;
          }
        }}
      >
        {rows.length === 0 ? (
          <p className={cn(FILE_LIST_ROW_CLASS, 'px-1.5')}>
            <span className="flex items-center text-tiny text-muted-foreground">
              {emptyMessage}
            </span>
          </p>
        ) : (
          <div
            className="relative"
            style={{
              height: virtualizer.getTotalSize(),
              minWidth: `var(--file-list-min-width)`
            }}
          >
            {virtualizer.getVirtualItems().map((item) => {
              const row = rows[item.index];
              if (row === undefined) {
                return null;
              }

              return (
                <div
                  key={item.key}
                  className={cn(
                    'absolute top-0 left-0 w-full',
                    item.index % 2 === 0 ? 'bg-foreground/3' : 'bg-foreground/7'
                  )}
                  style={{ transform: `translateY(${item.start}px)` }}
                >
                  {renderRow(row, item.index)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
