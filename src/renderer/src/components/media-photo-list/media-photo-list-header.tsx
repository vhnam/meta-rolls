import { IconChevronDown } from '@tabler/icons-react';
import { cn } from 'cn';
import { useRef } from 'react';

import {
  FILE_LIST_CELL_CLASS,
  FILE_LIST_COLUMNS,
  FILE_LIST_ROW_CLASS,
  type FileListColumnId
} from '#/constants/media';

type MediaPhotoListHeaderProps = {
  widths: Record<FileListColumnId, number>;
  onResizeColumn: (id: FileListColumnId, width: number) => void;
};

type ColumnResizeHandleProps = {
  label: string;
  minWidth: number;
  width: number;
  onResize: (width: number) => void;
};

const ColumnResizeHandle = ({ label, minWidth, width, onResize }: ColumnResizeHandleProps) => {
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  return (
    <span
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${label} column`}
      className="absolute inset-y-0 right-0 z-10 w-1.5 translate-x-1/2 cursor-col-resize hover:bg-foreground/25"
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = { startX: event.clientX, startWidth: width };
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (!drag) {
          return;
        }

        onResize(Math.max(minWidth, drag.startWidth + (event.clientX - drag.startX)));
      }}
      onPointerUp={() => {
        dragRef.current = null;
      }}
    />
  );
};

export const MediaPhotoListHeader = ({ widths, onResizeColumn }: MediaPhotoListHeaderProps) => {
  return (
    <div className={cn(FILE_LIST_ROW_CLASS, 'sticky top-0 z-20 bg-muted select-none')}>
      {FILE_LIST_COLUMNS.map((column, index) => (
        <div
          key={column.id}
          className={cn(
            FILE_LIST_CELL_CLASS,
            'relative',
            index < FILE_LIST_COLUMNS.length - 1 && 'border-e border-border'
          )}
        >
          <span className="truncate text-tiny font-medium text-muted-foreground">
            {column.label}
          </span>
          {column.id === 'name' ? (
            <IconChevronDown className="ml-auto size-3 shrink-0 text-muted-foreground" />
          ) : null}
          <ColumnResizeHandle
            label={column.label}
            minWidth={column.minWidth}
            width={widths[column.id]}
            onResize={(width) => onResizeColumn(column.id, width)}
          />
        </div>
      ))}
    </div>
  );
};
