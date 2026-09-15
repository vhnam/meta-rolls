import { useMemo } from 'react';

import { PhotoListRow, PhotoListShell } from '#/components/photo-list';
import { type PhotoFolder, type PhotoItem } from '#/types';

import { MediaBrowserListFolder } from './media-browser-list-folder';

type MediaBrowserListProps = {
  folders: PhotoFolder[];
  photos: PhotoItem[];
  selectedPhotoId: string | null;
  selectedListFolderId: string | null;
  onSelectPhoto: (id: string) => void;
  onHighlightFolder: (id: string) => void;
  onOpenFolder: (id: string) => void;
};

type MediaBrowserListRow =
  | { type: 'folder'; id: string; folder: PhotoFolder }
  | { type: 'photo'; id: string; photo: PhotoItem };

export const MediaBrowserList = ({
  folders,
  photos,
  selectedPhotoId,
  selectedListFolderId,
  onSelectPhoto,
  onHighlightFolder,
  onOpenFolder
}: MediaBrowserListProps) => {
  const rows = useMemo<MediaBrowserListRow[]>(
    () => [
      ...folders.map((folder) => ({ type: 'folder' as const, id: folder.id, folder })),
      ...photos.map((photo) => ({ type: 'photo' as const, id: photo.id, photo }))
    ],
    [folders, photos]
  );

  return (
    <PhotoListShell
      rows={rows}
      getRowKey={(row) => row.id}
      emptyMessage="No files in this folder."
      renderRow={(row) =>
        row.type === 'folder' ? (
          <MediaBrowserListFolder
            folder={row.folder}
            selected={row.folder.id === selectedListFolderId}
            onHighlightFolder={onHighlightFolder}
            onOpenFolder={onOpenFolder}
          />
        ) : (
          <PhotoListRow
            photo={row.photo}
            selected={row.photo.id === selectedPhotoId}
            dragId={row.photo.id}
            dragData={{ photoId: row.photo.id }}
            onSelectPhoto={onSelectPhoto}
          />
        )
      }
    />
  );
};
