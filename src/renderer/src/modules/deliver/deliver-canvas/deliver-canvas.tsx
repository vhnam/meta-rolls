import { DragOverlay, type DragEndEvent } from '@dnd-kit/react';
import { Fragment, useEffect, useMemo, useState } from 'react';

import { PreviewZoomSelect } from '#/components/preview-zoom-select';
import { toast } from '#/components/ui/toast';
import {
  BOOK_PAGE_COUNT,
  DEFAULT_SLOT_SETTINGS,
  isInstaxFormat,
  leadingEmptySlots,
  PHOTOS_PER_PAGE
} from '#/constants/canvas';
import { PRINT_FORMAT } from '#/constants/settings';
import { useCanvasPanzoom } from '#/hooks/use-canvas-panzoom';
import { getApi } from '#/hooks/use-ipc';
import { bookPageFolio } from '#/shared/print';
import { useAlbumStore } from '#/stores/album.store';
import { useCanvasStore } from '#/stores/canvas.store';
import { useSettingsStore } from '#/stores/settings.store';
import { type PhotoItem } from '#/types';
import { cn, readDragString } from '#/utils/common';
import { getInstaxCardGeometry, toMediaFileUrl } from '#/utils/photo';

import { DeliverCanvasSidebar } from './deliver-canvas-sidebar';
import { DeliverCanvasSlot, deliverSlotPhotoStyle } from './deliver-canvas-slot';
import { getDeliverPageMetrics } from './deliver-page-metrics';

const SLOT_DROP_ANIMATION = { duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' };

type DeliverCanvasProps = {
  albumId: string | null;
  photos: PhotoItem[];
};

const buildSlotId = (pageIndex: number, slotIndex: number) => `page-${pageIndex}-slot-${slotIndex}`;

const SLOT_IDS = Array.from({ length: BOOK_PAGE_COUNT * PHOTOS_PER_PAGE }, (_, index) =>
  buildSlotId(Math.floor(index / PHOTOS_PER_PAGE), index % PHOTOS_PER_PAGE)
);

const getPageIndexFromSlotId = (slotId: string) => Number(slotId.split('-')[1]);

export const applyDeliverLayoutDragEnd = (event: DragEndEvent) => {
  if (event.canceled) {
    return false;
  }
  const targetSlotId = readDragString(event.operation.target?.data, 'slotId');
  if (!targetSlotId) {
    return false;
  }
  const targetIndex = SLOT_IDS.indexOf(targetSlotId);
  if (targetIndex === -1) {
    return true;
  }

  const sourceSlotId = readDragString(event.operation.source?.data, 'slotId');
  const photoId = readDragString(event.operation.source?.data, 'photoId');
  const { activeSpreadIndex, swapSpreadSlots, placePhotoInSpreadSlot } = useCanvasStore.getState();

  if (sourceSlotId) {
    const sourceIndex = SLOT_IDS.indexOf(sourceSlotId);
    if (sourceIndex !== -1 && sourceIndex !== targetIndex) {
      swapSpreadSlots(activeSpreadIndex, sourceIndex, targetIndex);
    }
    return true;
  }

  if (photoId) {
    placePhotoInSpreadSlot(activeSpreadIndex, targetIndex, photoId);
    return true;
  }

  return true;
};

export function DeliverCanvas({ albumId, photos }: DeliverCanvasProps) {
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
  const [book, setBook] = useState<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { zoomValue, applyZoom } = useCanvasPanzoom({ viewport, target: book, enabled: true });
  const album = useAlbumStore((state) => state.albums.find((item) => item.id === albumId));
  const albumName = album?.name ?? 'Album';
  const defaultPrintFormat = useSettingsStore((state) => state.defaultPrintFormat);
  const fallbackPreset = isInstaxFormat(defaultPrintFormat)
    ? defaultPrintFormat
    : PRINT_FORMAT.instaxMini;
  const pagePreset = album?.pagePreset ?? fallbackPreset;
  const pageSize = album?.pageSize ?? null;
  const showPageNumbers = album?.showPageNumbers ?? false;
  const leftHandFirst = album?.leftHandFirst ?? false;
  const selectedSlotId = useCanvasStore((state) => state.selectedSlotId);
  const selectSlot = useCanvasStore((state) => state.selectSlot);
  const slotSettings = useCanvasStore((state) => state.slotSettings);
  const activeSpreadIndex = useCanvasStore((state) => state.activeSpreadIndex);
  const spreadPhotoIds = useCanvasStore((state) => state.spreadPhotoIds);
  const rotateSlotImage = useCanvasStore((state) => state.rotateSlotImage);
  const clearSpreadSlot = useCanvasStore((state) => state.clearSpreadSlot);
  const syncSpreadsWithPhotos = useCanvasStore((state) => state.syncSpreadsWithPhotos);

  const photoIds = useMemo(() => photos.map((photo) => photo.id), [photos]);
  const leadEmptySlots = leadingEmptySlots(leftHandFirst);
  const photosKey = useMemo(
    () => `${leadEmptySlots}:${[...photoIds].sort().join(',')}`,
    [leadEmptySlots, photoIds]
  );

  useEffect(() => {
    syncSpreadsWithPhotos(photosKey, photoIds, leadEmptySlots);
  }, [photosKey, photoIds, leadEmptySlots, syncSpreadsWithPhotos]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (book?.contains(target)) {
        return;
      }
      if (target instanceof Element && target.closest('[data-slot^="context-menu"]')) {
        return;
      }
      selectSlot(null);
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [book, selectSlot]);

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

  const { pageStyle, cardHeightPx, folioStyle } = getDeliverPageMetrics(pageSize, pagePreset);

  const handleExportPdf = async () => {
    if (!albumId) {
      return;
    }
    setIsExporting(true);
    try {
      const filePath = await getApi().deliver.exportPdf({
        albumName,
        pagePreset,
        pageSize,
        showPageNumbers,
        leftHandFirst,
        pages: spreadPhotoIds.flatMap((ids) =>
          Array.from({ length: BOOK_PAGE_COUNT }, (_page, pageIndex) => ({
            rotationDeg: getRotationDeg(pageIndex),
            slots: Array.from({ length: PHOTOS_PER_PAGE }, (_slot, slotIndex) => {
              const photoId = ids[pageIndex * PHOTOS_PER_PAGE + slotIndex];
              const photo = photoId ? (photoById.get(photoId) ?? null) : null;
              const slotId = buildSlotId(pageIndex, slotIndex);
              return {
                path: photo?.path ?? null,
                name: photo?.name ?? '',
                fit: slotSettings[slotId]?.fit ?? DEFAULT_SLOT_SETTINGS.fit,
                imageRotationDeg:
                  slotSettings[slotId]?.imageRotationDeg ?? DEFAULT_SLOT_SETTINGS.imageRotationDeg
              };
            })
          }))
        )
      });
      if (filePath) {
        toast.add({
          type: 'success',
          title: 'PDF exported',
          description: filePath
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleRemoveFromCanvas = (slotId: string) => {
    const slotIndex = SLOT_IDS.indexOf(slotId);
    if (slotIndex === -1) {
      return;
    }
    clearSpreadSlot(activeSpreadIndex, slotIndex, slotId);
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
          <div
            key={activeSpreadIndex}
            ref={setBook}
            className="flex animate-in items-stretch duration-200 fade-in-0 zoom-in-95"
          >
            {pages.map((slots, pageIndex) => (
              <Fragment key={pageIndex}>
                {pageIndex === 1 ? (
                  <div
                    aria-hidden
                    className="w-2 shrink-0 self-stretch bg-neutral-300 shadow-[inset_6px_0_8px_-4px_rgb(0_0_0/0.28),inset_-6px_0_8px_-4px_rgb(0_0_0/0.28)] dark:bg-neutral-500"
                  />
                ) : null}
                <div
                  style={pageStyle}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-3 bg-white p-4 shadow-md dark:bg-neutral-100/95',
                    pageIndex === 0 ? 'rounded-l-sm' : 'rounded-r-sm'
                  )}
                >
                  <div
                    className={cn(
                      'flex flex-col items-center justify-center gap-3',
                      activeSpreadIndex === 0 &&
                        pageIndex === 0 &&
                        !leftHandFirst &&
                        'invisible pointer-events-none'
                    )}
                  >
                    {slots.map(({ slotId, photo }) => (
                      <DeliverCanvasSlot
                        key={slotId}
                        slotId={slotId}
                        photo={photo}
                        fit={slotSettings[slotId]?.fit ?? DEFAULT_SLOT_SETTINGS.fit}
                        format={pagePreset}
                        cardHeightPx={cardHeightPx}
                        rotationDeg={getRotationDeg(pageIndex)}
                        imageRotationDeg={
                          slotSettings[slotId]?.imageRotationDeg ??
                          DEFAULT_SLOT_SETTINGS.imageRotationDeg
                        }
                        isSelected={selectedSlotId === slotId}
                        onSelect={selectSlot}
                        onRotateImage={rotateSlotImage}
                        onRemoveFromCanvas={handleRemoveFromCanvas}
                      />
                    ))}
                  </div>
                  {showPageNumbers
                    ? (() => {
                        const folio = bookPageFolio(
                          activeSpreadIndex * BOOK_PAGE_COUNT + pageIndex,
                          leftHandFirst
                        );
                        return folio === null ? null : (
                          <span
                            className="pointer-events-none absolute font-medium tabular-nums text-neutral-500"
                            style={folioStyle}
                          >
                            {folio}
                          </span>
                        );
                      })()
                    : null}
                </div>
              </Fragment>
            ))}
          </div>

          <DragOverlay dropAnimation={SLOT_DROP_ANIMATION}>
            {(source) => {
              const slotId = readDragString(source.data, 'slotId');
              const draggedPhotoId = readDragString(source.data, 'photoId');
              const photo = slotId
                ? (photoBySlotId.get(slotId) ?? null)
                : draggedPhotoId
                  ? (photoById.get(draggedPhotoId) ?? null)
                  : null;
              if (!photo) {
                return null;
              }
              const src = photo.path ? toMediaFileUrl(photo.path) : null;
              const fit =
                (slotId ? slotSettings[slotId]?.fit : undefined) ?? DEFAULT_SLOT_SETTINGS.fit;
              const imageRotationDeg =
                (slotId ? slotSettings[slotId]?.imageRotationDeg : undefined) ??
                DEFAULT_SLOT_SETTINGS.imageRotationDeg;
              const { cardWidthPx, imageWidthPx, imageHeightPx, topPx, sidePx } =
                getInstaxCardGeometry(pagePreset, cardHeightPx);
              const rotationDeg = slotId ? getRotationDeg(getPageIndexFromSlotId(slotId)) : 0;
              const tiltDeg = rotationDeg < 0 ? -3 : 3;
              const isQuarterTurn = rotationDeg % 180 !== 0;

              return (
                <div
                  className="relative"
                  style={{
                    width: isQuarterTurn ? cardHeightPx : cardWidthPx,
                    height: isQuarterTurn ? cardWidthPx : cardHeightPx
                  }}
                >
                  <div
                    className="absolute top-1/2 left-1/2 border-2 border-primary bg-white shadow-2xl dark:bg-neutral-100"
                    style={{
                      width: cardWidthPx,
                      height: cardHeightPx,
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
                          className="absolute top-1/2 left-1/2 max-w-none"
                          style={deliverSlotPhotoStyle(
                            imageWidthPx,
                            imageHeightPx,
                            imageRotationDeg,
                            fit
                          )}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            }}
          </DragOverlay>
        </div>

        <DeliverCanvasSidebar
          albumId={albumId}
          pagePreset={pagePreset}
          pageSize={pageSize}
          showPageNumbers={showPageNumbers}
          leftHandFirst={leftHandFirst}
          isExporting={isExporting}
          onExport={() => void handleExportPdf()}
        />
      </div>
    </section>
  );
}
