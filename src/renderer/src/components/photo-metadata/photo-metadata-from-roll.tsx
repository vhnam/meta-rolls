import { useMemo } from 'react';

import { METADATA_LABEL_CLASS, METADATA_ROW_CLASS, METADATA_VALUE_CLASS } from '#/constants/media';
import { findFrameByScanPath, formatPushPull, pushPullStops } from '#/shared/rolls';
import { useRollsStore } from '#/stores/rolls.store';
import { type PhotoItem } from '#/types';

type PhotoMetadataFromRollProps = {
  photo: PhotoItem;
};

/** Film details recorded in Rolls for a photo whose file is linked to a frame. Renders nothing otherwise. */
export function PhotoMetadataFromRoll({ photo }: PhotoMetadataFromRollProps) {
  const rolls = useRollsStore((state) => state.rolls);
  const stocks = useRollsStore((state) => state.stocks);
  const cameras = useRollsStore((state) => state.cameras);
  const lenses = useRollsStore((state) => state.lenses);

  const rows = useMemo(() => {
    const linked = photo.path ? findFrameByScanPath(rolls, photo.path) : null;
    if (!linked) {
      return [];
    }
    const { roll, frame } = linked;
    const stock = stocks.find((item) => item.id === roll.stockId);
    const camera = cameras.find((item) => item.id === roll.cameraId);
    const lens = lenses.find((item) => item.id === (frame.lensId ?? roll.lensId));
    const pushPull = stock ? formatPushPull(pushPullStops(stock.iso, roll.shotIso)) : null;
    const entries: [string, string | null][] = [
      ['Roll', `${roll.name} · frame ${frame.number}`],
      ['Film stock', stock ? `${stock.brand} ${stock.name}`.trim() : null],
      ['Shot ISO', `${roll.shotIso}${pushPull ? ` (${pushPull})` : ''}`],
      ['Camera', camera ? `${camera.brand} ${camera.model}`.trim() : null],
      ['Lens', lens?.name ?? null],
      ['Aperture', frame.aperture || null],
      ['Shutter', frame.shutter || null]
    ];
    return entries.flatMap(([label, value]) => (value ? [{ label, value }] : []));
  }, [photo.path, rolls, stocks, cameras, lenses]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <section className="mb-2">
      <h3 className="bg-sidebar py-1 text-tiny font-medium text-sidebar-foreground">From roll</h3>
      <dl>
        {rows.map((row) => (
          <div key={row.label} className={METADATA_ROW_CLASS}>
            <dt className={METADATA_LABEL_CLASS}>{row.label}</dt>
            <dd className={METADATA_VALUE_CLASS} title={row.value}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
