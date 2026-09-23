import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { closeAppDatabase } from './app-database';
import {
  addFrame,
  archiveGear,
  checkRollScans,
  createRolls,
  deleteRoll,
  linkScans,
  moveFrameScan,
  readSnapshot,
  removeLastFrame,
  saveDevJob,
  saveGear,
  setRollStatus,
  unlinkScans,
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

  it('links scans in frame order, adds frames on request, and unlinks', () => {
    const [id] = createRolls(file, { stockId: addStock() });
    updateRoll(file, id, { exposures: 2 });
    const paths = ['/s/1.jpg', '/s/2.jpg', '/s/3.jpg'];

    linkScans(file, id, '/s', paths, false);
    let roll = readSnapshot(file).rolls[0];
    expect(roll.scanFolder).toBe('/s');
    expect(roll.frames[0].scanPath).toBe('/s/1.jpg');
    expect(roll.frames[2].scanPath).toBe('/s/3.jpg');

    // Relinking clears earlier links; a shorter list leaves the tail empty.
    linkScans(file, id, '/s', ['/s/9.jpg'], false);
    roll = readSnapshot(file).rolls[0];
    expect(roll.frames.filter((f) => f.scanPath).length).toBe(1);

    const short = createRolls(file, { stockId: readSnapshot(file).stocks[0].id })[0];
    linkScans(
      file,
      short,
      '/t',
      Array.from({ length: 40 }, (_, i) => `/t/${i}.jpg`),
      true
    );
    const grown = readSnapshot(file).rolls.find((r) => r.id === short)!;
    expect(grown.frames).toHaveLength(40);
    expect(grown.exposures).toBe(40);

    unlinkScans(file, id);
    roll = readSnapshot(file).rolls.find((r) => r.id === id)!;
    expect(roll.scanFolder).toBeNull();
    expect(roll.frames.every((f) => f.scanPath === null)).toBe(true);
  });

  it('moves a scan to another frame, swapping when the target is taken', () => {
    const [id] = createRolls(file, { stockId: addStock() });
    linkScans(file, id, '/s', ['/s/a.jpg', '/s/b.jpg'], false);
    const [f1, f2, f3] = readSnapshot(file).rolls[0].frames;
    moveFrameScan(file, f1.id, f2.id);
    let frames = readSnapshot(file).rolls[0].frames;
    expect([frames[0].scanPath, frames[1].scanPath]).toEqual(['/s/b.jpg', '/s/a.jpg']);
    moveFrameScan(file, f2.id, f3.id);
    frames = readSnapshot(file).rolls[0].frames;
    expect([frames[1].scanPath, frames[2].scanPath]).toEqual([null, '/s/a.jpg']);
  });

  it('flags a missing folder and missing scan files', () => {
    const [id] = createRolls(file, { stockId: addStock() });
    const present = join(dir, 'present.jpg');
    writeFileSync(present, 'x');
    linkScans(file, id, dir, [present, join(dir, 'gone.jpg')], false);
    expect(checkRollScans(file, id)).toEqual({
      folderMissing: false,
      missingPaths: [join(dir, 'gone.jpg')]
    });
    linkScans(file, id, join(dir, 'nope'), [present], false);
    expect(checkRollScans(file, id).folderMissing).toBe(true);
  });
});
