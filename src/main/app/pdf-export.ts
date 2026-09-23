import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { BrowserWindow } from 'electron';

import {
  type DeliverPdfExportRequest,
  type DeliverPdfPage,
  bookPageFolio,
  folioFontMm,
  slotImageLayout
} from '../../../shared/print';
import { readDisplayBytes } from './media-protocol';

const INSTAX_CARD_MM = {
  'instax-mini': { width: 54, height: 86 },
  'instax-wide': { width: 108, height: 86 }
} as const;

const INSTAX_IMAGE_MM = {
  'instax-mini': { width: 46, height: 62 },
  'instax-wide': { width: 99, height: 62 }
} as const;

const PAPER_MM = {
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
  letter: { width: 215.9, height: 279.4 }
} as const;

const PAGE_PADDING_MM = 8;
const SLOT_GAP_MM = 4;
const MM_PER_INCH = 25.4;

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const mm = (value: number) => `${Number(value.toFixed(3))}mm`;

const toInchPageSize = (paper: { width: number; height: number }) => ({
  width: paper.width / MM_PER_INCH,
  height: paper.height / MM_PER_INCH
});

type PrintCardLayout = {
  wrapWidth: number;
  wrapHeight: number;
  windowTop: number;
  windowLeft: number;
  windowWidth: number;
  windowHeight: number;
};

// Lay the print out in its rotated footprint. CSS transforms overflow in
// Chromium print and collapse Auto pages onto each other.
const printCardLayout = (
  pagePreset: DeliverPdfExportRequest['pagePreset'],
  rotationDeg: number,
  scale: number
): PrintCardLayout => {
  const card = INSTAX_CARD_MM[pagePreset];
  const image = INSTAX_IMAGE_MM[pagePreset];
  const width = card.width * scale;
  const height = card.height * scale;
  const imageWidth = image.width * scale;
  const imageHeight = image.height * scale;
  const side = ((card.width - image.width) / 2) * scale;
  const verticalMargin = (card.height - image.height) * scale;
  const top = Math.min(side, verticalMargin);
  const turn = ((Math.round(rotationDeg) % 360) + 360) % 360;

  if (turn === 90) {
    return {
      wrapWidth: height,
      wrapHeight: width,
      windowTop: side,
      windowLeft: height - top - imageHeight,
      windowWidth: imageHeight,
      windowHeight: imageWidth
    };
  }
  if (turn === 270) {
    return {
      wrapWidth: height,
      wrapHeight: width,
      windowTop: width - side - imageWidth,
      windowLeft: top,
      windowWidth: imageHeight,
      windowHeight: imageWidth
    };
  }
  if (turn === 180) {
    return {
      wrapWidth: width,
      wrapHeight: height,
      windowTop: height - top - imageHeight,
      windowLeft: width - side - imageWidth,
      windowWidth: imageWidth,
      windowHeight: imageHeight
    };
  }
  return {
    wrapWidth: width,
    wrapHeight: height,
    windowTop: top,
    windowLeft: side,
    windowWidth: imageWidth,
    windowHeight: imageHeight
  };
};

const paperFromCardStack = (
  pagePreset: DeliverPdfExportRequest['pagePreset'],
  pages: DeliverPdfPage[]
) => {
  const measured: DeliverPdfPage[] = pages.length > 0 ? pages : [{ rotationDeg: 0, slots: [] }];
  let width = 0;
  let height = 0;
  for (const page of measured) {
    const layout = printCardLayout(pagePreset, page.rotationDeg, 1);
    const slotCount = Math.max(1, page.slots.length);
    const stackHeight = layout.wrapHeight * slotCount + SLOT_GAP_MM * Math.max(0, slotCount - 1);
    width = Math.max(width, layout.wrapWidth + PAGE_PADDING_MM * 2);
    height = Math.max(height, stackHeight + PAGE_PADDING_MM * 2);
  }
  return { width, height };
};

const cssPaperSize = (
  pageSize: DeliverPdfExportRequest['pageSize'],
  paper: { width: number; height: number }
) => {
  if (pageSize === 'a4') {
    return 'A4';
  }
  if (pageSize === 'a5') {
    return 'A5';
  }
  if (pageSize === 'letter') {
    return 'letter';
  }
  return `${(paper.width / MM_PER_INCH).toFixed(4)}in ${(paper.height / MM_PER_INCH).toFixed(4)}in`;
};

const resolvePaperMm = (request: DeliverPdfExportRequest) =>
  request.pageSize
    ? PAPER_MM[request.pageSize]
    : paperFromCardStack(request.pagePreset, request.pages);

const extensionForMime = (mime: string) => (mime === 'image/png' ? '.png' : '.jpg');

const buildPageHtml = async (
  page: DeliverPdfPage,
  pagePreset: DeliverPdfExportRequest['pagePreset'],
  paper: { width: number; height: number },
  workDir: string,
  imageIndex: { current: number },
  pageNumber: number | null
) => {
  const unscaled = printCardLayout(pagePreset, page.rotationDeg, 1);
  const stackHeight =
    unscaled.wrapHeight * page.slots.length + SLOT_GAP_MM * Math.max(0, page.slots.length - 1);
  const innerWidth = paper.width - PAGE_PADDING_MM * 2;
  const innerHeight = paper.height - PAGE_PADDING_MM * 2;
  const fitScale = Math.min(
    1,
    innerWidth / unscaled.wrapWidth,
    stackHeight > 0 ? innerHeight / stackHeight : 1
  );
  const layout = printCardLayout(pagePreset, page.rotationDeg, fitScale);
  const image = INSTAX_IMAGE_MM[pagePreset];
  const imageWidth = image.width * fitScale;
  const imageHeight = image.height * fitScale;
  const turn = ((Math.round(page.rotationDeg) % 360) + 360) % 360;

  const slots: string[] = [];
  const isBlankPage = page.slots.every((slot) => !slot.path);
  if (!isBlankPage) {
    for (const slot of page.slots) {
      let img = '';
      if (slot.path) {
        try {
          const display = await readDisplayBytes(slot.path);
          if (display) {
            const fileName = `img-${imageIndex.current}${extensionForMime(display.mime)}`;
            imageIndex.current += 1;
            await writeFile(join(workDir, fileName), display.body);
            const imageBox = slotImageLayout(imageWidth, imageHeight, slot.imageRotationDeg);
            const imgRotation = turn + imageBox.rotationDeg;
            const imgFit = `position:absolute;top:50%;left:50%;width:${mm(imageBox.width)};height:${mm(imageBox.height)};transform:translate(-50%,-50%) rotate(${imgRotation}deg);object-fit:${slot.fit}`;
            img = `<img src="${fileName}" alt="${escapeHtml(slot.name)}" style="${imgFit}" />`;
          }
        } catch {
          img = '';
        }
      }
      slots.push(`
      <div class="card" style="width:${mm(layout.wrapWidth)};height:${mm(layout.wrapHeight)}">
        <div class="window" style="top:${mm(layout.windowTop)};left:${mm(layout.windowLeft)};width:${mm(layout.windowWidth)};height:${mm(layout.windowHeight)}">${img}</div>
      </div>`);
    }
  }

  const folio = pageNumber === null ? '' : `<span class="folio">${pageNumber}</span>`;
  return `<section class="page">${slots.join('')}${folio}</section>`;
};

const buildPrintHtml = (
  paper: { width: number; height: number },
  pageSize: DeliverPdfExportRequest['pageSize'],
  pagesHtml: string
) => {
  const folioMm = folioFontMm(paper.height);
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @page { size: ${cssPaperSize(pageSize, paper)}; margin: 0; }
      html, body { margin: 0; padding: 0; background: #fff; }
      .page {
        box-sizing: border-box;
        position: relative;
        display: flex;
        width: ${mm(paper.width)};
        height: ${mm(paper.height)};
        overflow: hidden;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: ${mm(SLOT_GAP_MM)};
        padding: ${mm(PAGE_PADDING_MM)};
        background: #fff;
        break-after: page;
        page-break-after: always;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .page:last-child { break-after: auto; page-break-after: auto; }
      .card {
        box-sizing: border-box;
        position: relative;
        flex-shrink: 0;
        overflow: hidden;
        border: 0.3mm solid #d4d4d8;
        background: #fff;
      }
      .window {
        position: absolute;
        overflow: hidden;
        background: #f4f4f5;
      }
      .folio {
        position: absolute;
        right: ${mm(PAGE_PADDING_MM)};
        bottom: ${mm(folioMm * 0.55)};
        font: 500 ${mm(folioMm)}/1 Helvetica, Arial, sans-serif;
        color: #71717a;
      }
    </style>
  </head>
  <body>
    ${pagesHtml}
  </body>
</html>`;
};

export const renderDeliverPdf = async (request: DeliverPdfExportRequest): Promise<Buffer> => {
  const paper = resolvePaperMm(request);
  const workDir = await mkdtemp(join(tmpdir(), 'meta-rolls-pdf-'));
  const printWindow = new BrowserWindow({
    show: false,
    width: Math.ceil(paper.width * 4),
    height: Math.ceil(paper.height * 4),
    webPreferences: {
      sandbox: true,
      contextIsolation: true
    }
  });

  try {
    const imageIndex = { current: 0 };
    const pages: string[] = [];
    for (const [index, page] of request.pages.entries()) {
      pages.push(
        await buildPageHtml(
          page,
          request.pagePreset,
          paper,
          workDir,
          imageIndex,
          request.showPageNumbers ? bookPageFolio(index, request.leftHandFirst) : null
        )
      );
    }
    const htmlPath = join(workDir, 'print.html');
    await writeFile(htmlPath, buildPrintHtml(paper, request.pageSize, pages.join('')));
    await printWindow.loadFile(htmlPath);
    await printWindow.webContents.executeJavaScript(`
      Promise.all(Array.from(document.images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
        });
      }))
    `);

    return await printWindow.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true,
      pageSize: toInchPageSize(paper),
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });
  } finally {
    if (!printWindow.isDestroyed()) {
      printWindow.destroy();
    }
    await rm(workDir, { recursive: true, force: true });
  }
};
