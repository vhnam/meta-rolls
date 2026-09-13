import { useMemo } from 'react';

import { usePhotoExif } from '#/hooks/use-photo-exif';
import { type PhotoItem } from '#/types';
import { buildMetadataRows, getPhotoOverview, groupMetadataRows } from '#/utils';

import MediaMetadataOverview from './media-metadata-overview';

type MediaMetadataProps = {
  photo: PhotoItem | null;
};

const MediaMetadata = ({ photo }: MediaMetadataProps) => {
  const filePath = photo?.path ?? null;
  const { exif, loading } = usePhotoExif(filePath);
  const overview = getPhotoOverview(exif?.fields);

  const groups = useMemo(
    () => (photo ? groupMetadataRows(buildMetadataRows(photo, exif?.fields)) : []),
    [exif?.fields, photo]
  );

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden border border-border bg-sidebar">
      <div className="flex h-7 items-center justify-between border-b border-sidebar-border bg-muted px-2">
        <span className="text-tiny font-medium text-sidebar-foreground">Metadata</span>
      </div>
      {!photo ? (
        <div className="flex flex-1 items-center justify-center px-3">
          <p className="text-xs text-muted-foreground">Select a photo to view metadata</p>
        </div>
      ) : (
        <>
          <MediaMetadataOverview items={overview} />
          <div className="min-h-0 flex-1 overflow-auto px-3 py-2">
            {groups.map((group) => (
              <section key={group.name} className="mb-2 last:mb-0">
                <h3 className="bg-sidebar py-1 text-tiny font-medium text-sidebar-foreground">
                  {group.name}
                </h3>
                <dl>
                  {group.rows.map((row) => (
                    <div
                      key={`${group.name}:${row.label}`}
                      className="grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)] gap-x-2 gap-y-0.5 py-0.5"
                    >
                      <dt className="break-all text-tiny text-muted-foreground">{row.label}</dt>
                      <dd className="break-all text-tiny text-sidebar-foreground">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
            {loading ? <p className="pt-1 text-tiny text-muted-foreground">Reading EXIF…</p> : null}
          </div>
        </>
      )}
    </div>
  );
};

export default MediaMetadata;
