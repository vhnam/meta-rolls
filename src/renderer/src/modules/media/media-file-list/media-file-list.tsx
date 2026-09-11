import { IconFolder } from '@tabler/icons-react';
import { cn } from '#/lib/utils';
import { type PhotoFolder, type PhotoItem } from '#/modules/media/media-data';

type MediaFileListProps = {
  folders: PhotoFolder[];
  photos: PhotoItem[];
  selectedPhotoId: string | null;
  onSelectPhoto: (id: string) => void;
  onSelectFolder: (id: string) => void;
};

const COLS = 'grid-cols-[minmax(9rem,1fr)_6.25rem_4.75rem]';

const MediaFileList = ({
  folders,
  photos,
  selectedPhotoId,
  onSelectPhoto,
  onSelectFolder
}: MediaFileListProps) => {
  const isEmpty = folders.length === 0 && photos.length === 0;

  return (
    <section className="flex min-h-0 min-w-[20rem] flex-[1.2] flex-col overflow-hidden border-r border-border bg-background">
      <div
        className={cn(
          'grid h-6 shrink-0 border-b border-border bg-muted px-2 font-medium tracking-wide text-muted-foreground',
          COLS
        )}
      >
        <span className="truncate self-center text-tiny">File Name</span>
        <span className="truncate self-center text-tiny">Date</span>
        <span className="truncate self-center text-tiny">Camera</span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {isEmpty ? (
          <p className="px-3 py-6 text-xs text-muted-foreground">No photos in this folder.</p>
        ) : (
          <>
            {folders.map((folder, index) => (
              <button
                key={folder.id}
                type="button"
                className={cn(
                  'grid h-5.5 w-full min-w-[20rem] px-2 text-left text-sm hover:bg-muted',
                  COLS,
                  index % 2 === 1 && 'bg-muted/40'
                )}
                onClick={() => onSelectFolder(folder.id)}
              >
                <span className="flex min-w-0 items-center gap-1.5 self-center">
                  <IconFolder className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{folder.name}</span>
                </span>
                <span />
                <span />
              </button>
            ))}
            {photos.map((photo, index) => {
              const selected = photo.id === selectedPhotoId;
              const stripeIndex = folders.length + index;
              return (
                <button
                  key={photo.id}
                  type="button"
                  className={cn(
                    'grid h-5.5 w-full min-w-[20rem] px-2 text-left text-sm',
                    COLS,
                    stripeIndex % 2 === 1 && 'bg-muted/40',
                    selected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                  )}
                  onClick={() => onSelectPhoto(photo.id)}
                >
                  <span className="truncate self-center">{photo.name}</span>
                  <span className="self-center font-mono text-[11px] text-muted-foreground">
                    {photo.date}
                  </span>
                  <span className="truncate self-center text-muted-foreground">{photo.camera}</span>
                </button>
              );
            })}
          </>
        )}
      </div>
    </section>
  );
};

export default MediaFileList;
