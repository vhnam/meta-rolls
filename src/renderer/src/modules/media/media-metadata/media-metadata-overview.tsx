import { METADATA_OVERVIEW_GRID_CLASS } from '#/constants/media';
import { type PhotoOverviewItem } from '#/utils/photo-overview';

type MediaMetadataOverviewProps = {
  items: PhotoOverviewItem[];
};

const MediaMetadataOverview = ({ items }: MediaMetadataOverviewProps) => {
  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-sidebar-border bg-sidebar px-3 py-2">
      <dl className={METADATA_OVERVIEW_GRID_CLASS}>
        {items.map((item) => (
          <div key={item.id} className="min-w-0">
            <dt className="text-tiny text-muted-foreground">{item.label}</dt>
            <dd className="truncate text-tiny text-sidebar-foreground">{item.value || '-'}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
};

export default MediaMetadataOverview;
