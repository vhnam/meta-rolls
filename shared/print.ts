export type DeliverPdfFit = 'cover' | 'contain';

export type DeliverPdfSlot = {
  path: string | null;
  name: string;
  fit: DeliverPdfFit;
  imageRotationDeg: number;
};

export const normalizeRotationDeg = (rotationDeg: number) =>
  ((Math.round(rotationDeg) % 360) + 360) % 360;

export const slotImageLayout = (
  windowWidth: number,
  windowHeight: number,
  imageRotationDeg: number
) => {
  const rotationDeg = normalizeRotationDeg(imageRotationDeg);
  const quarter = rotationDeg % 180 !== 0;
  return {
    width: quarter ? windowHeight : windowWidth,
    height: quarter ? windowWidth : windowHeight,
    rotationDeg
  };
};

export type DeliverPdfPage = {
  rotationDeg: number;
  slots: DeliverPdfSlot[];
};

export type DeliverPdfExportRequest = {
  albumName: string;
  pagePreset: 'instax-mini' | 'instax-wide';
  pageSize: 'a4' | 'a5' | 'letter' | null;
  showPageNumbers: boolean;
  leftHandFirst: boolean;
  pages: DeliverPdfPage[];
};

export const folioFontMm = (pageHeightMm: number) =>
  Math.min(5.5, Math.max(2.4, pageHeightMm * 0.015));

export const bookPageFolio = (pageIndex: number, leftHandFirst: boolean): number | null => {
  // Spreads always read left → right. The flag only chooses which leaf of the
  // first opening is page 1 (left-hand vs right-hand), not RTL page order.
  if (leftHandFirst) {
    return pageIndex + 1;
  }
  return pageIndex === 0 ? null : pageIndex;
};

const isFit = (value: unknown): value is DeliverPdfFit => value === 'cover' || value === 'contain';

const isPagePreset = (value: unknown): value is DeliverPdfExportRequest['pagePreset'] =>
  value === 'instax-mini' || value === 'instax-wide';

const isPageSize = (value: unknown): value is DeliverPdfExportRequest['pageSize'] =>
  value === null || value === 'a4' || value === 'a5' || value === 'letter';

const parseSlot = (value: unknown): DeliverPdfSlot | null => {
  if (value === null || typeof value !== 'object') {
    return null;
  }
  const slot = value as Record<string, unknown>;
  if (slot.path !== null && typeof slot.path !== 'string') {
    return null;
  }
  if (typeof slot.name !== 'string' || !isFit(slot.fit)) {
    return null;
  }
  const imageRotationDeg = slot.imageRotationDeg === undefined ? 0 : slot.imageRotationDeg;
  if (typeof imageRotationDeg !== 'number' || !Number.isFinite(imageRotationDeg)) {
    return null;
  }
  return {
    path: slot.path,
    name: slot.name,
    fit: slot.fit,
    imageRotationDeg
  };
};

const parsePage = (value: unknown): DeliverPdfPage | null => {
  if (value === null || typeof value !== 'object') {
    return null;
  }
  const page = value as Record<string, unknown>;
  if (typeof page.rotationDeg !== 'number' || !Array.isArray(page.slots)) {
    return null;
  }
  const slots: DeliverPdfSlot[] = [];
  for (const slot of page.slots) {
    const parsed = parseSlot(slot);
    if (!parsed) {
      return null;
    }
    slots.push(parsed);
  }
  return { rotationDeg: page.rotationDeg, slots };
};

export const parseDeliverPdfExportRequest = (value: unknown): DeliverPdfExportRequest | null => {
  if (value === null || typeof value !== 'object') {
    return null;
  }
  const request = value as Record<string, unknown>;
  if (typeof request.albumName !== 'string' || !isPagePreset(request.pagePreset)) {
    return null;
  }
  if (!isPageSize(request.pageSize) || !Array.isArray(request.pages)) {
    return null;
  }
  if (request.showPageNumbers !== undefined && typeof request.showPageNumbers !== 'boolean') {
    return null;
  }
  if (
    (request.leftHandFirst !== undefined && typeof request.leftHandFirst !== 'boolean') ||
    (request.firstPageIsLeftHand !== undefined && typeof request.firstPageIsLeftHand !== 'boolean')
  ) {
    return null;
  }
  const pages: DeliverPdfPage[] = [];
  for (const page of request.pages) {
    const parsed = parsePage(page);
    if (!parsed) {
      return null;
    }
    pages.push(parsed);
  }
  return {
    albumName: request.albumName,
    pagePreset: request.pagePreset,
    pageSize: request.pageSize,
    showPageNumbers: request.showPageNumbers === true,
    leftHandFirst: request.leftHandFirst === true || request.firstPageIsLeftHand === true,
    pages
  };
};
