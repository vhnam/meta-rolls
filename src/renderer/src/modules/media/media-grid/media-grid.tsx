import { IconDots, IconLayoutGrid, IconSearch } from '@tabler/icons-react';
import { Button } from '#/components/ui/button';
import { cn } from '#/lib/utils';
import { type PhotoItem } from '#/types';

type MediaGridProps = {
  title?: string;
  photos: PhotoItem[];
  selectedPhotoId: string | null;
  onSelectPhoto: (id: string) => void;
  zoom: number;
};

const MediaGrid = ({ title, photos, selectedPhotoId, onSelectPhoto, zoom }: MediaGridProps) => {
  const size = 48 + zoom * 1.2;

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
      <div className="flex h-7 shrink-0 items-center gap-1 border-b border-border bg-muted px-2">
        {title && <span className="text-[11px] font-medium">{title}</span>}
        <div className="ml-auto flex items-center">
          <Button variant="ghost" size="icon-xs">
            <IconLayoutGrid />
          </Button>
          <Button variant="ghost" size="icon-xs">
            <IconSearch />
          </Button>
          <Button variant="ghost" size="icon-xs">
            <IconDots />
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        <div className="flex flex-wrap content-start gap-3">
          {photos.map((photo) => {
            const selected = photo.id === selectedPhotoId;
            return (
              <button
                key={photo.id}
                type="button"
                className="flex flex-col items-center gap-1"
                onClick={() => onSelectPhoto(photo.id)}
              >
                <span
                  className={cn(
                    'block border border-border',
                    selected && 'border-primary ring-1 ring-primary'
                  )}
                  style={{ width: size, height: size * 0.72, background: photo.accent }}
                />
                <span className="max-w-28 truncate text-tiny text-muted-foreground">
                  {photo.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MediaGrid;
