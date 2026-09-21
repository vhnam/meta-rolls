import { INSTAX_CARD_DIMENSIONS, PAPER_PAGE_DIMENSIONS, PHOTOS_PER_PAGE } from '#/constants/canvas';
import { PRINT_FORMAT } from '#/constants/settings';
import { type InstaxPrintFormat, type PaperPrintFormat } from '#/types';

import { folioFontMm } from '#/shared/print';

export const AUTO_CARD_HEIGHT_PX = 176;
// Preview height for a paper sheet. Width follows the chosen format's aspect
// ratio; Instax cards then scale from their real millimetre size relative to
// that sheet (and shrink further if padding/gap would overflow).
export const PAPER_PAGE_HEIGHT_PX = 460;
const PAGE_PADDING_PX = 16;
const SLOT_GAP_PX = 12;

type DeliverFolioStyle = {
  fontSize: number;
  right: number;
  bottom: number;
};

type DeliverPageMetrics = {
  pageStyle: { width: number; height: number } | undefined;
  cardHeightPx: number;
  folioStyle: DeliverFolioStyle;
};

const folioStyleFromMm = (fontMm: number, pxPerMm: number): DeliverFolioStyle => {
  const fontSize = fontMm * pxPerMm;
  return {
    fontSize,
    right: PAGE_PADDING_PX / 2,
    bottom: Math.max(4, fontSize * 0.55)
  };
};

export const getDeliverPageMetrics = (
  pageSize: PaperPrintFormat | null,
  pagePreset: InstaxPrintFormat
): DeliverPageMetrics => {
  const card = INSTAX_CARD_DIMENSIONS[pagePreset];
  const isQuarterTurn = pagePreset === PRINT_FORMAT.instaxMini;

  if (!pageSize) {
    const pxPerMm = AUTO_CARD_HEIGHT_PX / card.height;
    const layoutHeightMm = isQuarterTurn ? card.width : card.height;
    const pageHeightMm =
      layoutHeightMm * PHOTOS_PER_PAGE +
      (SLOT_GAP_PX / pxPerMm) * Math.max(0, PHOTOS_PER_PAGE - 1) +
      (PAGE_PADDING_PX / pxPerMm) * 2;
    return {
      pageStyle: undefined,
      cardHeightPx: AUTO_CARD_HEIGHT_PX,
      folioStyle: folioStyleFromMm(folioFontMm(pageHeightMm), pxPerMm)
    };
  }

  const paper = PAPER_PAGE_DIMENSIONS[pageSize];
  const pageHeight = PAPER_PAGE_HEIGHT_PX;
  const pageWidth = pageHeight * (paper.width / paper.height);
  const pxPerMm = pageHeight / paper.height;
  const physicalCardHeightPx = card.height * pxPerMm;
  const layoutWidthPx = (isQuarterTurn ? card.height : card.width) * pxPerMm;
  const layoutHeightPx = (isQuarterTurn ? card.width : card.height) * pxPerMm;
  const stackHeightPx =
    layoutHeightPx * PHOTOS_PER_PAGE + SLOT_GAP_PX * Math.max(0, PHOTOS_PER_PAGE - 1);
  const innerWidthPx = pageWidth - PAGE_PADDING_PX * 2;
  const innerHeightPx = pageHeight - PAGE_PADDING_PX * 2;
  const fitScale = Math.min(1, innerWidthPx / layoutWidthPx, innerHeightPx / stackHeightPx);

  return {
    pageStyle: { width: pageWidth, height: pageHeight },
    cardHeightPx: physicalCardHeightPx * fitScale,
    folioStyle: folioStyleFromMm(folioFontMm(paper.height), pxPerMm)
  };
};
