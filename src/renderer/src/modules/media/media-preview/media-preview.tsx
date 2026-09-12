import { type PhotoItem } from '#/types';

type MediaPreviewProps = {
  photo: PhotoItem | null;
};

const MediaPreview = ({ photo }: MediaPreviewProps) => {
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
    </section>
  );
};

export default MediaPreview;
