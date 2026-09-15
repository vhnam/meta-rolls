import { useMemo } from 'react';

import { PhotoThumbnailShell, PhotoThumbnailTile } from '#/components/photo-list';
import { THUMBNAIL_PANE_CLASS } from '#/constants/media';
import { type PhotoFolder, type PhotoItem } from '#/types';
import { getThumbnailColumnCount } from '#/utils';

import { MediaBrowserThumbnailFolder } from './media-browser-thumbnail-folder';

type MediaBrowserThumbnailsProps = {
  folders: PhotoFolder[];
  photos: PhotoItem[];
  selectedPhotoId: string | null;
  selectedListFolderId: string | null;
  zoom: number;
  onSelectPhoto: (id: string) => void;
  onHighlightFolder: (id: string) => void;
  onOpenFolder: (id: string) => void;
};

type MediaBrowserThumbnailItem =
  | { type: 'folder'; id: string; folder: PhotoFolder }
  | { type: 'photo'; id: string; photo: PhotoItem };

export const MediaBrowserThumbnails = ({
  folders,
  photos,
  selectedPhotoId,
  selectedListFolderId,
  zoom,
  onSelectPhoto,
  onHighlightFolder,
  onOpenFolder
}: MediaBrowserThumbnailsProps) => {
  const columns = getThumbnailColumnCount(zoom);
  const items = useMemo<MediaBrowserThumbnailItem[]>(
    () => [
      ...folders.map((folder) => ({ type: 'folder' as const, id: folder.id, folder })),
      ...photos.map((photo) => ({ type: 'photo' as const, id: photo.id, photo }))
    ],
    [folders, photos]
  );

  return (
    <section className={THUMBNAIL_PANE_CLASS}>
      <PhotoThumbnailShell
        isEmpty={items.length === 0}
        emptyMessage="No files in this folder."
        columns={columns}
      >
        {items.map((item) =>
          item.type === 'folder' ? (
            <MediaBrowserThumbnailFolder
              key={item.id}
              folder={item.folder}
              selected={item.folder.id === selectedListFolderId}
              onHighlightFolder={onHighlightFolder}
              onOpenFolder={onOpenFolder}
            />
          ) : (
            <PhotoThumbnailTile
              key={item.id}
              photo={item.photo}
              selected={item.photo.id === selectedPhotoId}
              dragId={item.photo.id}
              dragData={{ photoId: item.photo.id }}
              onSelectPhoto={onSelectPhoto}
            />
          )
        )}
      </PhotoThumbnailShell>
    </section>
  );
};
