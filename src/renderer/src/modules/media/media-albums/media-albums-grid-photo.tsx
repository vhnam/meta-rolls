import { cn } from 'cn';
import { useState } from 'react';

import { type AlbumPhoto } from '#/types';
import { toMediaFileUrl } from '#/utils';

type MediaAlbumsGridPhotoProps = {
  photo: AlbumPhoto;
  selected: boolean;
  width: number;
  height: number;
  onSelectPhoto: (id: string) => void;
};

export const MediaAlbumsGridPhoto = ({
  photo,
  selected,
  width,
  height,
  onSelectPhoto
}: MediaAlbumsGridPhotoProps) => {
  const [failed, setFailed] = useState(false);
  const src = photo.path ? toMediaFileUrl(photo.path) : null;

  return (
    <button
      type="button"
      className="flex flex-col items-center gap-1"
      onClick={() => onSelectPhoto(photo.id)}
    >
      <span
        className={cn(
          'block overflow-hidden border border-border bg-muted',
          selected && 'border-primary ring-1 ring-primary'
        )}
        style={{ width, height }}
      >
        {src && !failed && (
          <img
            src={src}
            alt={photo.name}
            draggable={false}
            className="size-full select-none object-cover"
            onError={() => setFailed(true)}
          />
        )}
      </span>
      <span className="max-w-28 truncate text-tiny text-muted-foreground">{photo.name}</span>
    </button>
  );
};
