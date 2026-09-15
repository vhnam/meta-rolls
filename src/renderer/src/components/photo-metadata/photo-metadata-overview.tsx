import {
  METADATA_OVERVIEW_CELL_CLASS,
  METADATA_OVERVIEW_CARD_CLASS,
  METADATA_OVERVIEW_LAYOUT_CLASS
} from '#/constants/media';
import { type PhotoOverviewCell, type PhotoOverviewCards } from '#/utils/metadata/photo-overview';

type PhotoMetadataOverviewProps = {
  cards: PhotoOverviewCards;
};

const overviewCellValueClass = 'block max-w-full truncate';

const OverviewCellContent = ({ cell }: { cell: PhotoOverviewCell }) => {
  if (cell.kind === 'aperture') {
    return (
      <span className={`inline-flex max-w-full items-baseline gap-px ${overviewCellValueClass}`}>
        <span className="shrink-0 font-serif text-xs italic text-muted-foreground">f/</span>
        <span className="truncate">{cell.value}</span>
      </span>
    );
  }

  if (cell.kind === 'iso') {
    return <span className={overviewCellValueClass}>{`ISO ${cell.value}`}</span>;
  }

  return (
    <span
      className={`${overviewCellValueClass} ${cell.value === '--' ? 'text-muted-foreground' : ''}`}
      title={cell.value === '--' ? undefined : cell.value}
    >
      {cell.value}
    </span>
  );
};

const OverviewCard = ({ rows }: { rows: PhotoOverviewCards['exposure'] }) => (
  <div className={METADATA_OVERVIEW_CARD_CLASS}>
    <div className="grid grid-cols-2">
      {rows.map((row, rowIndex) =>
        row.map((cell, columnIndex) => {
          const colSpan = cell.colSpan ?? 1;
          return (
            <div
              key={`${rowIndex}-${columnIndex}`}
              className={`${METADATA_OVERVIEW_CELL_CLASS} border-border/70 ${
                colSpan === 2 ? 'col-span-2' : columnIndex === 0 ? 'border-r' : ''
              } ${rowIndex < rows.length - 1 ? 'border-b' : ''}`}
            >
              <OverviewCellContent cell={cell} />
            </div>
          );
        })
      )}
    </div>
  </div>
);

export function PhotoMetadataOverview({ cards }: PhotoMetadataOverviewProps) {
  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-sidebar-border bg-sidebar px-3 py-2">
      <div className={METADATA_OVERVIEW_LAYOUT_CLASS}>
        <OverviewCard rows={cards.exposure} />
        <OverviewCard rows={cards.file} />
      </div>
    </header>
  );
}
