import { describe, expect, it } from 'vitest';

import {
  type RollFrame,
  daysUntilExpiry,
  defaultRollName,
  formatPushPull,
  isFrameEmpty,
  nextRollStatus,
  planScanLink,
  pushPullStops
} from './rolls';

describe('rolls helpers', () => {
  it('computes push/pull in stops', () => {
    expect(pushPullStops(400, 800)).toBe(1);
    expect(pushPullStops(400, 200)).toBe(-1);
    expect(pushPullStops(400, 400)).toBe(0);
    expect(formatPushPull(1)).toBe('+1 push');
    expect(formatPushPull(-2)).toBe('-2 pull');
    expect(formatPushPull(0)).toBeNull();
  });

  it('names rolls year-number', () => {
    expect(defaultRollName(2026, 13)).toBe('2026-014');
  });

  it('walks the status lifecycle', () => {
    expect(nextRollStatus('unused')).toBe('loaded');
    expect(nextRollStatus('developed')).toBeNull();
  });

  it('counts days to expiry', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    expect(daysUntilExpiry('2026-01-11', now)).toBe(10);
    expect(daysUntilExpiry('2025-12-25', now)).toBeLessThan(0);
    expect(daysUntilExpiry(null, now)).toBeNull();
  });

  it('treats only scan-less, detail-less frames as empty', () => {
    const frame: RollFrame = {
      id: 'f',
      rollId: 'r',
      number: 1,
      aperture: '',
      shutter: '',
      lensId: null,
      shotAt: null,
      location: '',
      notes: '',
      blank: false,
      scanPath: null
    };
    expect(isFrameEmpty(frame)).toBe(true);
    expect(isFrameEmpty({ ...frame, blank: true })).toBe(true);
    expect(isFrameEmpty({ ...frame, notes: 'x' })).toBe(false);
    expect(isFrameEmpty({ ...frame, scanPath: '/a.jpg' })).toBe(false);
  });

  it('matches scan files to frames in natural filename order', () => {
    const files = ['10.jpg', '2.jpg', '1.jpg'].map((name) => ({ name, path: `/s/${name}` }));
    const frames = [1, 2, 3].map((number) => ({ id: `f${number}`, number }));
    const plan = planScanLink(files, frames);
    expect(plan.pairs.map((p) => [p.frameNumber, p.name])).toEqual([
      [1, '1.jpg'],
      [2, '2.jpg'],
      [3, '10.jpg']
    ]);
    expect(plan.extraFiles).toEqual([]);
    expect(plan.emptyFrameNumbers).toEqual([]);
  });

  it('reports extra files and empty frames when counts differ', () => {
    const frames = [1, 2, 3].map((number) => ({ id: `f${number}`, number }));
    const more = planScanLink(
      ['a', 'b', 'c', 'd'].map((n) => ({ name: n, path: `/${n}` })),
      frames
    );
    expect(more.extraFiles.map((f) => f.name)).toEqual(['d']);
    const fewer = planScanLink([{ name: 'a', path: '/a' }], frames);
    expect(fewer.emptyFrameNumbers).toEqual([2, 3]);
  });
});
