import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from 'cn';
import { type CSSProperties, useMemo, useRef, useState } from 'react';

import {
  FILE_LIST_COLUMNS,
  FILE_LIST_ROW_CLASS,
  FILE_LIST_ROW_HEIGHT,
  FILE_LIST_ROW_X_PADDING,
  type FileListColumnId
} from '#/constants/media';
import { type PhotoFolder, type PhotoItem } from '#/types';

import MediaFileListHeader from './media-file-list-header';
import MediaFolder from './media-folder';
import MediaPhoto from './media-photo';

type MediaFileListProps = {
  folders: PhotoFolder[];
  photos: PhotoItem[];
  selectedPhotoId: string | null;
  selectedListFolderId: string | null;
  onSelectPhoto: (id: string) => void;
  onHighlightFolder: (id: string) => void;
  onOpenFolder: (id: string) => void;
};

type FileListRow =
  | { type: 'folder'; id: string; folder: PhotoFolder }
  | { type: 'photo'; id: string; photo: PhotoItem };

const INITIAL_COLUMN_WIDTHS = Object.fromEntries(
  FILE_LIST_COLUMNS.map((column) => [column.id, column.defaultWidth])
) as Record<FileListColumnId, number>;

const MediaFileList = ({
  folders,
  photos,
  selectedPhotoId,
  selectedListFolderId,
  onSelectPhoto,
  onHighlightFolder,
  onOpenFolder
}: MediaFileListProps) => {
  'use no memo';
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [columnWidths, setColumnWidths] = useState(INITIAL_COLUMN_WIDTHS);
  const rows = useMemo<FileListRow[]>(
    () => [
      ...folders.map((folder) => ({ type: 'folder' as const, id: folder.id, folder })),
      ...photos.map((photo) => ({ type: 'photo' as const, id: photo.id, photo }))
    ],
    [folders, photos]
  );
  const columnSum = FILE_LIST_COLUMNS.reduce((sum, column) => sum + columnWidths[column.id], 0);
  const columnTemplate = FILE_LIST_COLUMNS.map((column) =>
    column.id === 'name'
      ? `minmax(${columnWidths[column.id]}px, 1fr)`
      : `${columnWidths[column.id]}px`
  ).join(' ');
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
    getItemKey: (index) => rows[index]?.id ?? index
  });

  return (
    <section
      className="flex min-h-0 min-w-[20rem] flex-[1.2] flex-col overflow-hidden bg-background"
      style={columnStyle}
    >
      <div
        ref={headerRef}
        className="shrink-0 overflow-x-auto border-b border-border bg-muted scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        <MediaFileListHeader
          widths={columnWidths}
          onResizeColumn={(id, width) =>
            setColumnWidths((current) => ({ ...current, [id]: width }))
          }
        />
      </div>
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 scroll-fade overflow-auto"
        onScroll={(event) => {
          if (headerRef.current) {
            headerRef.current.scrollLeft = event.currentTarget.scrollLeft;
          }
        }}
      >
        {rows.length === 0 ? (
          <p className={cn(FILE_LIST_ROW_CLASS, 'px-1.5')}>
            <span className="flex items-center text-tiny text-muted-foreground">
              No files in this folder.
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
              if (!row) {
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
                  {row.type === 'folder' ? (
                    <MediaFolder
                      folder={row.folder}
                      selected={row.folder.id === selectedListFolderId}
                      onHighlightFolder={onHighlightFolder}
                      onOpenFolder={onOpenFolder}
                    />
                  ) : (
                    <MediaPhoto
                      photo={row.photo}
                      selectedPhotoId={selectedPhotoId}
                      onSelectPhoto={onSelectPhoto}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default MediaFileList;
