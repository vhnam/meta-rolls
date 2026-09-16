import { DragDropProvider, DragOverlay, type DragEndEvent } from '@dnd-kit/react';
import { useEffect, useMemo, useState } from 'react';

import { PreviewZoomSelect } from '#/components/preview-zoom-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '#/components/ui/select';
import {
  BOOK_PAGE_COUNT,
  DEFAULT_SLOT_SETTINGS,
  isInstaxFormat,
  PAPER_PAGE_DIMENSIONS,
  PHOTOS_PER_PAGE
} from '#/constants/canvas';
import { PRINT_FORMAT } from '#/constants/settings';
import { useCanvasPanzoom } from '#/hooks/use-canvas-panzoom';
import { useCanvasStore } from '#/stores/canvas.store';
import { useSettingsStore } from '#/stores/settings.store';
import { type InstaxPrintFormat, type PaperPrintFormat, type PhotoItem } from '#/types';
import { cn, readDragString } from '#/utils/common';
import { getInstaxCardGeometry, toMediaFileUrl } from '#/utils/photo';

import { DeliverCanvasSlot } from './deliver-canvas-slot';

const CARD_HEIGHT_PX = 176;
// Tall enough to hold two stacked Instax cards (2 * 176 + gap + padding) with
// visible margin once a paper page size is layered on top.
const PAPER_PAGE_HEIGHT_PX = 460;
const PAGE_SIZE_NONE = 'auto';
const SLOT_DROP_ANIMATION = { duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' };

const PAGE_PRESET_OPTIONS = [
  { value: PRINT_FORMAT.instaxMini, label: 'Instax Mini' },
  { value: PRINT_FORMAT.instaxWide, label: 'Instax Wide' }
] as const;

const PAGE_SIZE_OPTIONS = [
  { value: PAGE_SIZE_NONE, label: 'Auto' },
  { value: PRINT_FORMAT.a4, label: 'A4' },
  { value: PRINT_FORMAT.a5, label: 'A5' },
  { value: PRINT_FORMAT.letter, label: 'Letter' }
] as const;

type DeliverCanvasProps = {
  albumId: string | null;
  photos: PhotoItem[];
};

const buildSlotId = (pageIndex: number, slotIndex: number) => `page-${pageIndex}-slot-${slotIndex}`;

const SLOT_IDS = Array.from({ length: BOOK_PAGE_COUNT * PHOTOS_PER_PAGE }, (_, index) =>
  buildSlotId(Math.floor(index / PHOTOS_PER_PAGE), index % PHOTOS_PER_PAGE)
);

const getPageIndexFromSlotId = (slotId: string) => Number(slotId.split('-')[1]);

export function DeliverCanvas({ albumId, photos }: DeliverCanvasProps) {
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const [book, setBook] = useState<HTMLDivElement | null>(null);
  const { zoomValue, applyZoom } = useCanvasPanzoom({ viewport, target: book, enabled: true });
  const defaultPrintFormat = useSettingsStore((state) => state.defaultPrintFormat);
  const pagePresetByAlbumId = useCanvasStore((state) => state.pagePresetByAlbumId);
  const pageSizeByAlbumId = useCanvasStore((state) => state.pageSizeByAlbumId);
  const setAlbumPagePreset = useCanvasStore((state) => state.setAlbumPagePreset);
  const setAlbumPageSize = useCanvasStore((state) => state.setAlbumPageSize);
  const fallbackPreset = isInstaxFormat(defaultPrintFormat)
    ? defaultPrintFormat
    : PRINT_FORMAT.instaxMini;
  const pagePreset = (albumId ? pagePresetByAlbumId[albumId] : undefined) ?? fallbackPreset;
  const pageSize = (albumId ? pageSizeByAlbumId[albumId] : undefined) ?? null;
  const selectedSlotId = useCanvasStore((state) => state.selectedSlotId);
  const selectSlot = useCanvasStore((state) => state.selectSlot);
  const slotSettings = useCanvasStore((state) => state.slotSettings);
  const activeSpreadIndex = useCanvasStore((state) => state.activeSpreadIndex);
  const spreadPhotoIds = useCanvasStore((state) => state.spreadPhotoIds);
  const swapSpreadSlots = useCanvasStore((state) => state.swapSpreadSlots);
  const syncSpreadsWithPhotos = useCanvasStore((state) => state.syncSpreadsWithPhotos);

  const handlePagePresetChange = (value: string | null) => {
    if (albumId && value) {
      setAlbumPagePreset(albumId, value as InstaxPrintFormat);
    }
  };
  const handlePageSizeChange = (value: string | null) => {
    if (!albumId) {
      return;
    }
    setAlbumPageSize(
      albumId,
      value && value !== PAGE_SIZE_NONE ? (value as PaperPrintFormat) : null
    );
  };

  const photoIds = useMemo(() => photos.map((photo) => photo.id), [photos]);
  const photosKey = useMemo(() => [...photoIds].sort().join(','), [photoIds]);

  useEffect(() => {
    syncSpreadsWithPhotos(photosKey, photoIds);
  }, [photosKey, photoIds, syncSpreadsWithPhotos]);

  const activeSpreadPhotoIds = spreadPhotoIds[activeSpreadIndex] ?? [];
  const photoById = useMemo(() => new Map(photos.map((photo) => [photo.id, photo])), [photos]);

  const slotEntries = SLOT_IDS.map((slotId, index) => {
    const photoId = activeSpreadPhotoIds[index];
    return { slotId, photo: photoId ? (photoById.get(photoId) ?? null) : null };
  });
  const pages = Array.from({ length: BOOK_PAGE_COUNT }, (_, pageIndex) =>
    slotEntries.slice(pageIndex * PHOTOS_PER_PAGE, pageIndex * PHOTOS_PER_PAGE + PHOTOS_PER_PAGE)
  );
  const photoBySlotId = new Map(slotEntries.map(({ slotId, photo }) => [slotId, photo]));

  const getRotationDeg = (pageIndex: number) =>
    pagePreset === PRINT_FORMAT.instaxMini ? (pageIndex === 0 ? -90 : 90) : 0;

  const pageStyle = pageSize
    ? {
        width:
          PAPER_PAGE_HEIGHT_PX *
          (PAPER_PAGE_DIMENSIONS[pageSize].width / PAPER_PAGE_DIMENSIONS[pageSize].height),
        height: PAPER_PAGE_HEIGHT_PX
      }
    : undefined;

  const handleSlotDragEnd = (event: DragEndEvent) => {
    if (event.canceled) {
      return;
    }
    const sourceSlotId = readDragString(event.operation.source?.data, 'slotId');
    const targetSlotId = readDragString(event.operation.target?.data, 'slotId');
    if (!sourceSlotId || !targetSlotId || sourceSlotId === targetSlotId) {
      return;
    }
    const sourceIndex = SLOT_IDS.indexOf(sourceSlotId);
    const targetIndex = SLOT_IDS.indexOf(targetSlotId);
    if (sourceIndex === -1 || targetIndex === -1) {
      return;
    }
    swapSpreadSlots(activeSpreadIndex, sourceIndex, targetIndex);
  };

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden border border-border bg-card">
      <div className="flex h-7 shrink-0 items-center gap-2 border-b border-border bg-muted px-2 text-muted-foreground">
        <PreviewZoomSelect value={zoomValue} disabled={!book} onChange={applyZoom} />
        <span className="text-tiny font-medium text-foreground">Layout</span>
      </div>

      <div className="flex min-h-0 flex-1">
        <div
          ref={setViewport}
          className="relative flex min-h-0 min-w-0 flex-1 touch-none items-center justify-center overflow-hidden overscroll-none bg-card p-4"
        >
          <DragDropProvider onDragEnd={handleSlotDragEnd}>
            <div
              key={activeSpreadIndex}
              ref={setBook}
              className="flex animate-in items-stretch overflow-hidden rounded-sm bg-background shadow-md duration-200 fade-in-0 zoom-in-95"
            >
              {pages.map((slots, pageIndex) => (
                <div
                  key={pageIndex}
                  style={pageStyle}
                  className={cn(
                    'flex flex-col items-center justify-center gap-3 bg-white p-4 dark:bg-neutral-100/95',
                    pageIndex === 0 && 'border-r border-border/60'
                  )}
                >
                  {slots.map(({ slotId, photo }) => (
                    <DeliverCanvasSlot
                      key={slotId}
                      slotId={slotId}
                      photo={photo}
                      fit={slotSettings[slotId]?.fit ?? DEFAULT_SLOT_SETTINGS.fit}
                      format={pagePreset}
                      cardHeightPx={CARD_HEIGHT_PX}
                      rotationDeg={getRotationDeg(pageIndex)}
                      isSelected={selectedSlotId === slotId}
                      onSelect={selectSlot}
                    />
                  ))}
                </div>
              ))}
            </div>

            <DragOverlay dropAnimation={SLOT_DROP_ANIMATION}>
              {(source) => {
                const slotId = readDragString(source.data, 'slotId');
                const photo = slotId ? photoBySlotId.get(slotId) : null;
                if (!photo) {
                  return null;
                }
                const src = photo.path ? toMediaFileUrl(photo.path) : null;
                const fit =
                  (slotId ? slotSettings[slotId]?.fit : undefined) ?? DEFAULT_SLOT_SETTINGS.fit;
                const { cardWidthPx, imageWidthPx, imageHeightPx, topPx, sidePx } =
                  getInstaxCardGeometry(pagePreset, CARD_HEIGHT_PX);
                const rotationDeg = slotId ? getRotationDeg(getPageIndexFromSlotId(slotId)) : 0;
                const tiltDeg = rotationDeg < 0 ? -3 : 3;
                const isQuarterTurn = rotationDeg % 180 !== 0;

                return (
                  <div
                    className="relative"
                    style={{
                      width: isQuarterTurn ? CARD_HEIGHT_PX : cardWidthPx,
                      height: isQuarterTurn ? cardWidthPx : CARD_HEIGHT_PX
                    }}
                  >
                    <div
                      className="absolute top-1/2 left-1/2 border-2 border-primary bg-white shadow-2xl dark:bg-neutral-100"
                      style={{
                        width: cardWidthPx,
                        height: CARD_HEIGHT_PX,
                        transform: `translate(-50%, -50%) rotate(${rotationDeg + tiltDeg}deg) scale(1.06)`
                      }}
                    >
                      <div
                        className="absolute overflow-hidden bg-muted"
                        style={{
                          top: topPx,
                          left: sidePx,
                          width: imageWidthPx,
                          height: imageHeightPx
                        }}
                      >
                        {src ? (
                          <img
                            src={src}
                            alt={photo.name}
                            className="h-full w-full"
                            style={{ objectFit: fit }}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              }}
            </DragOverlay>
          </DragDropProvider>
        </div>

        <div className="flex w-36 shrink-0 flex-col gap-3 border-l border-border bg-muted/40 p-3">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="deliver-page-preset"
              className="text-tiny font-medium text-muted-foreground"
            >
              Page preset
            </label>
            <Select
              items={PAGE_PRESET_OPTIONS}
              value={pagePreset}
              disabled={!albumId}
              onValueChange={handlePagePresetChange}
            >
              <SelectTrigger id="deliver-page-preset" size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_PRESET_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="deliver-page-size"
              className="text-tiny font-medium text-muted-foreground"
            >
              Page size
            </label>
            <Select
              items={PAGE_SIZE_OPTIONS}
              value={pageSize ?? PAGE_SIZE_NONE}
              disabled={!albumId}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger id="deliver-page-size" size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </section>
  );
}
