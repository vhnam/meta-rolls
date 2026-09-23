import { describe, expect, it } from 'vitest';

import {
  bookPageFolio,
  folioFontMm,
  normalizeRotationDeg,
  parseDeliverPdfExportRequest,
  slotImageLayout
} from './print';

describe('normalizeRotationDeg', () => {
  it('leaves an in-range angle untouched', () => {
    expect(normalizeRotationDeg(0)).toBe(0);
    expect(normalizeRotationDeg(90)).toBe(90);
    expect(normalizeRotationDeg(270)).toBe(270);
  });

  it('wraps a full turn back to 0', () => {
    expect(normalizeRotationDeg(360)).toBe(0);
    expect(normalizeRotationDeg(720)).toBe(0);
  });

  it('wraps angles past a full turn', () => {
    expect(normalizeRotationDeg(450)).toBe(90);
  });

  it('wraps negative angles into range', () => {
    expect(normalizeRotationDeg(-90)).toBe(270);
    expect(normalizeRotationDeg(-450)).toBe(270);
  });

  it('rounds fractional degrees before wrapping', () => {
    expect(normalizeRotationDeg(89.6)).toBe(90);
    expect(normalizeRotationDeg(-0.4)).toBe(0);
  });
});

describe('slotImageLayout', () => {
  it('keeps width/height as-is at 0 and 180 degrees', () => {
    expect(slotImageLayout(100, 50, 0)).toEqual({ width: 100, height: 50, rotationDeg: 0 });
    expect(slotImageLayout(100, 50, 180)).toEqual({ width: 100, height: 50, rotationDeg: 180 });
  });

  it('swaps width/height at 90 and 270 degrees', () => {
    expect(slotImageLayout(100, 50, 90)).toEqual({ width: 50, height: 100, rotationDeg: 90 });
    expect(slotImageLayout(100, 50, 270)).toEqual({ width: 50, height: 100, rotationDeg: 270 });
  });

  it('normalizes an out-of-range rotation before deciding the swap', () => {
    // 450 normalizes to 90 — same swap as a plain 90.
    expect(slotImageLayout(100, 50, 450)).toEqual({ width: 50, height: 100, rotationDeg: 90 });
  });
});

describe('folioFontMm', () => {
  it('scales with page height inside the clamp range', () => {
    // 200mm * 0.015 = 3, inside [2.4, 5.5].
    expect(folioFontMm(200)).toBeCloseTo(3);
  });

  it('clamps to the minimum for small pages', () => {
    expect(folioFontMm(1)).toBe(2.4);
  });

  it('clamps to the maximum for large pages', () => {
    expect(folioFontMm(1000)).toBe(5.5);
  });
});

describe('bookPageFolio', () => {
  it('numbers every spread from 1 when the first page is left-hand', () => {
    expect(bookPageFolio(0, true)).toBe(1);
    expect(bookPageFolio(1, true)).toBe(2);
    expect(bookPageFolio(2, true)).toBe(3);
  });

  it('leaves the very first spread unnumbered otherwise, then continues from its own index', () => {
    expect(bookPageFolio(0, false)).toBeNull();
    expect(bookPageFolio(1, false)).toBe(1);
    expect(bookPageFolio(2, false)).toBe(2);
  });
});

describe('parseDeliverPdfExportRequest', () => {
  const validRequest = {
    albumName: 'Summer Trip',
    pagePreset: 'instax-mini',
    pageSize: 'a4',
    showPageNumbers: true,
    leftHandFirst: false,
    pages: [
      {
        rotationDeg: 0,
        slots: [
          { path: '/photos/a.jpg', name: 'a.jpg', fit: 'cover', imageRotationDeg: 90 },
          { path: null, name: 'empty slot', fit: 'contain' }
        ]
      }
    ]
  };

  it('parses a fully valid request', () => {
    const parsed = parseDeliverPdfExportRequest(validRequest);
    expect(parsed).toEqual({
      albumName: 'Summer Trip',
      pagePreset: 'instax-mini',
      pageSize: 'a4',
      showPageNumbers: true,
      leftHandFirst: false,
      pages: [
        {
          rotationDeg: 0,
          slots: [
            { path: '/photos/a.jpg', name: 'a.jpg', fit: 'cover', imageRotationDeg: 90 },
            { path: null, name: 'empty slot', fit: 'contain', imageRotationDeg: 0 }
          ]
        }
      ]
    });
  });

  it('defaults a slot missing imageRotationDeg to 0', () => {
    const parsed = parseDeliverPdfExportRequest(validRequest);
    expect(parsed?.pages[0].slots[1].imageRotationDeg).toBe(0);
  });

  it('accepts the legacy firstPageIsLeftHand alias for leftHandFirst', () => {
    const { leftHandFirst: _omit, ...rest } = validRequest;
    const parsed = parseDeliverPdfExportRequest({ ...rest, firstPageIsLeftHand: true });
    expect(parsed?.leftHandFirst).toBe(true);
  });

  it('defaults showPageNumbers to false when omitted', () => {
    const { showPageNumbers: _omit, ...rest } = validRequest;
    const parsed = parseDeliverPdfExportRequest(rest);
    expect(parsed?.showPageNumbers).toBe(false);
  });

  it.each([
    ['null', null],
    ['a string', 'not an object'],
    ['missing albumName', { ...validRequest, albumName: undefined }],
    ['a non-string albumName', { ...validRequest, albumName: 42 }],
    ['an invalid pagePreset', { ...validRequest, pagePreset: 'polaroid' }],
    ['an invalid pageSize', { ...validRequest, pageSize: 'letter-ish' }],
    ['a non-array pages', { ...validRequest, pages: 'nope' }],
    ['a non-boolean showPageNumbers', { ...validRequest, showPageNumbers: 'yes' }],
    ['a page missing rotationDeg', { ...validRequest, pages: [{ slots: [] }] }],
    [
      'a page with non-array slots',
      { ...validRequest, pages: [{ rotationDeg: 0, slots: 'nope' }] }
    ],
    [
      'a slot with an invalid fit',
      {
        ...validRequest,
        pages: [{ rotationDeg: 0, slots: [{ path: null, name: 'x', fit: 'stretch' }] }]
      }
    ],
    [
      'a slot with a non-string, non-null path',
      {
        ...validRequest,
        pages: [{ rotationDeg: 0, slots: [{ path: 5, name: 'x', fit: 'cover' }] }]
      }
    ],
    [
      'a slot with a non-finite imageRotationDeg',
      {
        ...validRequest,
        pages: [
          {
            rotationDeg: 0,
            slots: [{ path: null, name: 'x', fit: 'cover', imageRotationDeg: Infinity }]
          }
        ]
      }
    ]
  ])('rejects %s', (_label, input) => {
    expect(parseDeliverPdfExportRequest(input)).toBeNull();
  });
});
