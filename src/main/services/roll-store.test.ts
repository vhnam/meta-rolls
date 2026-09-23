import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { closeAppDatabase } from './app-database';
import {
  addFrame,
  archiveGear,
  createRolls,
  deleteRoll,
  readSnapshot,
  removeLastFrame,
  saveDevJob,
  saveGear,
  setRollStatus,
  updateFrames,
  updateRoll
} from './roll-store';

let dir: string;
let file: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'roll-store-'));
  file = join(dir, 'test.sqlite');
});

afterEach(() => {
  closeAppDatabase();
  rmSync(dir, { recursive: true, force: true });
});

const addStock = () =>
  saveGear(file, {
    kind: 'stock',
    value: { brand: 'Kodak', name: 'Portra 400', iso: 400, exposures: 36 }
  });

describe('rolls', () => {
  it('creates rolls with generated names and frames from the stock', () => {
    const stockId = addStock();
    const ids = createRolls(file, { stockId, quantity: 3 }, new Date('2026-05-01'));
    const { rolls } = readSnapshot(file);
    expect(ids).toHaveLength(3);
    expect(rolls.map((r) => r.name).sort()).toEqual(['2026-001', '2026-002', '2026-003']);
    expect(rolls[0].frames).toHaveLength(36);
    expect(rolls[0].status).toBe('unused');
    expect(rolls[0].shotIso).toBe(400);
  });

  it('stamps the entry date only once when the status changes', () => {
    const [id] = createRolls(file, { stockId: addStock() });
    setRollStatus(file, id, 'loaded', new Date('2026-06-01T10:00:00Z'));
    setRollStatus(file, id, 'loaded', new Date('2026-06-09T10:00:00Z'));
    expect(readSnapshot(file).rolls[0].loadedAt).toBe('2026-06-01');
  });

  it('adds frames when exposures grow and never drops scanned frames', () => {
    const [id] = createRolls(file, { stockId: addStock() });
    updateRoll(file, id, { exposures: 38 });
    expect(readSnapshot(file).rolls[0].frames).toHaveLength(38);
    const last = readSnapshot(file).rolls[0].frames[37];
    updateFrames(file, [last.id], { scanPath: '/scans/038.jpg' });
    expect(removeLastFrame(file, id)).toBe(false);
    updateFrames(file, [last.id], { scanPath: null });
    expect(removeLastFrame(file, id)).toBe(true);
    addFrame(file, id);
    expect(readSnapshot(file).rolls[0].frames).toHaveLength(38);
  });

  it('edits several frames at once', () => {
    const [id] = createRolls(file, { stockId: addStock() });
    const frames = readSnapshot(file).rolls[0].frames.slice(0, 3);
    updateFrames(
      file,
      frames.map((f) => f.id),
      { aperture: 'f/2', blank: true }
    );
    const updated = readSnapshot(file).rolls[0].frames.slice(0, 4);
    expect(updated.slice(0, 3).every((f) => f.aperture === 'f/2' && f.blank)).toBe(true);
    expect(updated[3].aperture).toBe('');
    expect(id).toBeTruthy();
  });

  it('defaults dev job process to the stock and cascades on roll delete', () => {
    const [id] = createRolls(file, { stockId: addStock() });
    saveDevJob(file, { rollId: id, lab: 'Lab A', price: 120000, currency: '' });
    const job = readSnapshot(file).rolls[0].devJobs[0];
    expect(job.process).toBe('c41');
    expect(job.currency).toBe('VND');
    deleteRoll(file, id);
    expect(readSnapshot(file).rolls).toHaveLength(0);
  });

  it('archives gear without removing it', () => {
    const stockId = addStock();
    createRolls(file, { stockId });
    archiveGear(file, 'stock', stockId, true);
    const snapshot = readSnapshot(file);
    expect(snapshot.stocks[0].archived).toBe(true);
    expect(snapshot.rolls).toHaveLength(1);
  });
});
