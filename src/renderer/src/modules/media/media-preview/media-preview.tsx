import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Button } from '#/components/ui/button';
import { type PhotoItem } from '#/types';

type MediaPreviewProps = {
  photo: PhotoItem | null;
  onPrevious: () => void;
  onNext: () => void;
};

const MediaPreview = ({ photo, onPrevious, onNext }: MediaPreviewProps) => {
  return (
    <section className="flex min-h-0 min-w-[16rem] flex-1 flex-col bg-card">
      <div className="flex min-h-0 flex-1 items-center justify-center bg-card p-2">
        {photo ? (
          <div
            className="aspect-3/2 h-full max-h-full w-full max-w-180"
            style={{ background: photo.accent }}
            aria-label={photo.name}
          />
        ) : (
          <p className="text-xs text-muted-foreground">Select a photo to preview</p>
        )}
      </div>
      <div className="flex h-8 shrink-0 items-center justify-center gap-2 border-t border-border bg-muted">
        <Button variant="ghost" size="icon-xs" onClick={onPrevious} disabled={!photo}>
          <IconChevronLeft />
        </Button>
        <span className="min-w-40 truncate text-center font-mono text-[11px] text-muted-foreground">
          {photo?.name ?? '—'}
        </span>
        <Button variant="ghost" size="icon-xs" onClick={onNext} disabled={!photo}>
          <IconChevronRight />
        </Button>
      </div>
    </section>
  );
};

export default MediaPreview;
