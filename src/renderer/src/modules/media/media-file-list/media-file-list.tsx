import { cn } from 'cn';

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

export const COLUMN_CLASSES = 'grid-cols-[minmax(9rem,1fr)_6.25rem_4.75rem]';

const MediaFileList = ({
  folders,
  photos,
  selectedPhotoId,
  selectedListFolderId,
  onSelectPhoto,
  onHighlightFolder,
  onOpenFolder
}: MediaFileListProps) => {
  const isEmpty = folders.length === 0 && photos.length === 0;

  return (
    <section className="flex min-h-0 min-w-[20rem] flex-[1.2] flex-col overflow-hidden border-r border-border bg-background">
      <div
        className={cn(
          'grid h-6 shrink-0 border-b border-border bg-muted px-2 font-medium tracking-wide text-muted-foreground',
          COLUMN_CLASSES
        )}
      >
        <span className="truncate self-center text-tiny">File Name</span>
        <span className="truncate self-center text-tiny">Date</span>
        <span className="truncate self-center text-tiny">Camera</span>
      </div>
      <div className="min-h-0 flex-1 scroll-fade overflow-auto">
        {isEmpty ? (
          <p className="px-2 h-5.5 flex items-center text-tiny text-muted-foreground">
            No files in this folder.
          </p>
        ) : (
          <>
            {folders.map((folder, index) => (
              <MediaFolder
                key={folder.id}
                folder={folder}
                index={index}
                selected={folder.id === selectedListFolderId}
                onHighlightFolder={onHighlightFolder}
                onOpenFolder={onOpenFolder}
              />
            ))}
            {photos.map((photo, index) => (
              <MediaPhoto
                key={photo.id}
                photo={photo}
                selectedPhotoId={selectedPhotoId}
                folders={folders}
                index={index}
                onSelectPhoto={onSelectPhoto}
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
};

export default MediaFileList;
