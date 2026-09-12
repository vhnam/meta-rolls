import { useDroppable } from '@dnd-kit/react';
import { cn } from 'cn';

import { Album, type AlbumPhoto } from '#/types';
import { getGridThumbnailSize } from '#/utils';

import { MediaAlbumsGridPhoto } from './media-albums-grid-photo';

type MediaAlbumsGridProps = {
  album: Album;
  photos: AlbumPhoto[];
  selectedPhotoId: string | null;
  zoom: number;
  onSelectPhoto: (id: string) => void;
};

export const MediaAlbumsGrid = ({
  album,
  photos,
  selectedPhotoId,
  zoom,
  onSelectPhoto
}: MediaAlbumsGridProps) => {
  const size = getGridThumbnailSize(zoom);
  const { ref, isDropTarget } = useDroppable({
    id: album.id,
    data: { albumId: album.id }
  });

  return (
    <section className="flex min-h-0 min-w-[20rem] flex-[1.2] flex-col overflow-hidden bg-background">
      <div className="flex h-7 shrink-0 items-center border-b border-border bg-muted px-2">
        <span className="text-tiny font-medium">{album.name}</span>
      </div>
      {photos.length > 0 ? (
        <div
          ref={ref}
          className={cn(
            'min-h-0 flex-1 scroll-fade overflow-auto p-3',
            isDropTarget && 'bg-accent/40 outline outline-primary -outline-offset-2'
          )}
        >
          <div className="flex flex-wrap content-start gap-3">
            {photos.map((photo) => (
              <MediaAlbumsGridPhoto
                key={photo.id}
                photo={photo}
                selected={photo.id === selectedPhotoId}
                width={size.width}
                height={size.height}
                onSelectPhoto={onSelectPhoto}
              />
            ))}
          </div>
        </div>
      ) : (
        <div
          ref={ref}
          className={cn(
            'flex-1 flex items-center justify-center text-sidebar-foreground',
            isDropTarget && 'bg-accent/40 outline outline-primary -outline-offset-2'
          )}
        >
          <p className="text-xs text-muted-foreground">No photos found</p>
        </div>
      )}
    </section>
  );
};
