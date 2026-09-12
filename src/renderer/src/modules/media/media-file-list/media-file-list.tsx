import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from 'cn';
import { useMemo, useRef } from 'react';

import { FILE_LIST_COLUMN_CLASSES, FILE_LIST_ROW_HEIGHT } from '#/constants/media';
import { type PhotoFolder, type PhotoItem } from '#/types';

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
  const rows = useMemo<FileListRow[]>(
    () => [
      ...folders.map((folder) => ({ type: 'folder' as const, id: folder.id, folder })),
      ...photos.map((photo) => ({ type: 'photo' as const, id: photo.id, photo }))
    ],
    [folders, photos]
  );
  // oxlint-disable-next-line react/incompatible-library -- TanStack Virtual is opted out via `use no memo`
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => FILE_LIST_ROW_HEIGHT,
    overscan: 12,
    getItemKey: (index) => rows[index]?.id ?? index
  });

  return (
    <section className="flex min-h-0 min-w-[20rem] flex-[1.2] flex-col overflow-hidden bg-background">
      <div
        className={cn(
          'grid h-6 shrink-0 border-b border-border bg-muted px-2 font-medium tracking-wide text-muted-foreground',
          FILE_LIST_COLUMN_CLASSES
        )}
      >
        <span className="truncate self-center text-tiny">File Name</span>
        <span className="truncate self-center text-tiny">Date</span>
        <span className="truncate self-center text-tiny">Camera</span>
      </div>
      <div ref={scrollRef} className="min-h-0 flex-1 scroll-fade overflow-auto">
        {rows.length === 0 ? (
          <p className="px-2 h-5.5 flex items-center text-tiny text-muted-foreground">
            No files in this folder.
          </p>
        ) : (
          <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((item) => {
              const row = rows[item.index];
              if (!row) {
                return null;
              }

              return (
                <div
                  key={item.key}
                  className="absolute top-0 left-0 w-full"
                  style={{ transform: `translateY(${item.start}px)` }}
                >
                  {row.type === 'folder' ? (
                    <MediaFolder
                      folder={row.folder}
                      index={item.index}
                      selected={row.folder.id === selectedListFolderId}
                      onHighlightFolder={onHighlightFolder}
                      onOpenFolder={onOpenFolder}
                    />
                  ) : (
                    <MediaPhoto
                      photo={row.photo}
                      selectedPhotoId={selectedPhotoId}
                      index={item.index}
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
