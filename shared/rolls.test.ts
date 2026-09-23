import { describe, expect, it } from 'vitest';

import {
  daysUntilExpiry,
  defaultRollName,
  formatPushPull,
  nextRollStatus,
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
});
