import { useMemo } from 'react';

import {
  METADATA_LABEL_CLASS,
  METADATA_PANE_CLASS,
  METADATA_ROW_CLASS,
  METADATA_VALUE_CLASS
} from '#/constants/media';
import { usePhotoExif } from '#/hooks/use-photo-exif';
import { type PhotoItem } from '#/types';
import { buildMetadataRows, getPhotoOverviewCards, groupMetadataRows } from '#/utils';

import { PhotoMetadataOverview } from './photo-metadata-overview';

type PhotoMetadataProps = {
  photo: PhotoItem | null;
};

export const PhotoMetadata = ({ photo }: PhotoMetadataProps) => {
  const filePath = photo?.path ?? null;
  const { exif, loading } = usePhotoExif(filePath);
  const overviewCards = photo ? getPhotoOverviewCards(photo, exif?.fields) : null;

  const groups = useMemo(
    () => (photo ? groupMetadataRows(buildMetadataRows(photo, exif?.fields)) : []),
    [exif?.fields, photo]
  );

  return (
    <div className={METADATA_PANE_CLASS}>
      <div className="flex h-7 items-center justify-between border-b border-sidebar-border bg-muted px-2">
        <span className="text-tiny font-medium text-sidebar-foreground">Metadata</span>
      </div>
      {!photo ? (
        <div className="flex flex-1 items-center justify-center px-3">
          <p className="text-xs text-muted-foreground">Select a photo</p>
        </div>
      ) : (
        <>
          {overviewCards ? <PhotoMetadataOverview cards={overviewCards} /> : null}
          <div className="min-h-0 flex-1 scroll-fade overflow-auto px-3 py-2">
            {groups.map((group) => (
              <section key={group.name} className="mb-2 last:mb-0">
                <h3 className="bg-sidebar py-1 text-tiny font-medium text-sidebar-foreground">
                  {group.name}
                </h3>
                <dl>
                  {group.rows.map((row) => (
                    <div key={`${group.name}:${row.label}`} className={METADATA_ROW_CLASS}>
                      <dt className={METADATA_LABEL_CLASS}>{row.label}</dt>
                      <dd className={METADATA_VALUE_CLASS} title={row.value}>
                        {row.value}
                      </dd>
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
