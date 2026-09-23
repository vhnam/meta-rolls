import { INSTAX_CARD_DIMENSIONS, INSTAX_IMAGE_DIMENSIONS } from '#/constants/canvas';
import { type InstaxPrintFormat } from '#/types';

export type InstaxCardGeometry = {
  cardWidthPx: number;
  cardHeightPx: number;
  imageWidthPx: number;
  imageHeightPx: number;
  topPx: number;
  sidePx: number;
};

// Instax borders are thicker at the bottom (the branding strip), so the top
// border matches the side border thickness and the remainder falls to the
// bottom of the card.
export const getInstaxCardGeometry = (
  format: InstaxPrintFormat,
  cardHeightPx: number
): InstaxCardGeometry => {
  const card = INSTAX_CARD_DIMENSIONS[format];
  const image = INSTAX_IMAGE_DIMENSIONS[format];
  const scale = cardHeightPx / card.height;
  const sidePx = ((card.width - image.width) / 2) * scale;
  const verticalMarginPx = (card.height - image.height) * scale;
  const topPx = Math.min(sidePx, verticalMarginPx);

  return {
    cardWidthPx: card.width * scale,
    cardHeightPx,
    imageWidthPx: image.width * scale,
    imageHeightPx: image.height * scale,
    topPx,
    sidePx
  };
};
