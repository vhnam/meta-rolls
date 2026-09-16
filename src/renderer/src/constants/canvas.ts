import { PRINT_FORMAT } from '#/constants/settings';
import { type InstaxPrintFormat, type PaperPrintFormat, type PrintFormat } from '#/types';
import { type SlotSettings } from '#/types/canvas';

export const SLOT_FIT = {
  cover: 'cover',
  contain: 'contain'
} as const;

export const DEFAULT_SLOT_SETTINGS: SlotSettings = {
  fit: SLOT_FIT.cover,
  cropX: 0.5,
  cropY: 0.5,
  cropZoom: 1
};

// Instax print dimensions in millimeters. "Card" is the whole white-bordered
// print; "image" is the exposed picture window inset within it (the border is
// thicker at the bottom, matching the real film's branding strip).
export const INSTAX_CARD_DIMENSIONS: Record<InstaxPrintFormat, { width: number; height: number }> =
  {
    [PRINT_FORMAT.instaxMini]: { width: 54, height: 86 },
    [PRINT_FORMAT.instaxWide]: { width: 108, height: 86 }
  };

export const INSTAX_IMAGE_DIMENSIONS: Record<InstaxPrintFormat, { width: number; height: number }> =
  {
    [PRINT_FORMAT.instaxMini]: { width: 46, height: 62 },
    [PRINT_FORMAT.instaxWide]: { width: 99, height: 62 }
  };

// Standard paper sizes in millimeters (portrait). Unlike Instax prints, a
// paper page has no film border — the photo slots fill the sheet directly.
export const PAPER_PAGE_DIMENSIONS: Record<PaperPrintFormat, { width: number; height: number }> = {
  [PRINT_FORMAT.a4]: { width: 210, height: 297 },
  [PRINT_FORMAT.a5]: { width: 148, height: 210 },
  [PRINT_FORMAT.letter]: { width: 215.9, height: 279.4 }
};

export const isInstaxFormat = (format: PrintFormat): format is InstaxPrintFormat =>
  format === PRINT_FORMAT.instaxMini || format === PRINT_FORMAT.instaxWide;

export const isPaperFormat = (format: PrintFormat): format is PaperPrintFormat =>
  !isInstaxFormat(format);

export const PHOTOS_PER_PAGE = 2;
export const BOOK_PAGE_COUNT = 2;
export const SLOTS_PER_SPREAD = PHOTOS_PER_PAGE * BOOK_PAGE_COUNT;
