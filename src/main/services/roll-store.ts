import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { type DatabaseSync, type SQLInputValue } from 'node:sqlite';

import {
  type Camera,
  type DevJob,
  type FilmStock,
  type GearKind,
  type Lens,
  type Roll,
  type RollFrame,
  type RollStatus,
  type RollPatch,
  type RollScanStatus,
  type RollsSnapshot,
  DEFAULT_CURRENCY,
  STATUS_ENTRY_DATE,
  defaultRollName,
  isFrameEmpty
} from '../../../shared/rolls';
import { getAppDatabase } from './app-database';

type Row = Record<string, unknown>;

const str = (value: unknown): string => (typeof value === 'string' ? value : '');
const strOrNull = (value: unknown): string | null => (typeof value === 'string' ? value : null);
const num = (value: unknown): number => (typeof value === 'number' ? value : Number(value ?? 0));
const bool = (value: unknown): boolean => num(value) === 1;

const rows = (db: DatabaseSync, sql: string, ...params: SQLInputValue[]): Row[] =>
  db.prepare(sql).all(...params) as Row[];

const toStock = (r: Row): FilmStock => ({
  id: str(r.id),
  brand: str(r.brand),
  name: str(r.name),
  iso: num(r.iso),
  format: str(r.format) as FilmStock['format'],
  exposures: num(r.exposures),
  process: str(r.process) as FilmStock['process'],
  type: str(r.type) as FilmStock['type'],
  archived: bool(r.archived)
});

const toCamera = (r: Row): Camera => ({
  id: str(r.id),
  brand: str(r.brand),
  model: str(r.model),
  format: str(r.format) as Camera['format'],
  notes: str(r.notes),
  archived: bool(r.archived)
});

const toLens = (r: Row): Lens => ({
  id: str(r.id),
  name: str(r.name),
  focalLength: str(r.focal_length),
  maxAperture: str(r.max_aperture),
  mount: str(r.mount),
  archived: bool(r.archived)
});

const toDevJob = (r: Row): DevJob => ({
  id: str(r.id),
  rollId: str(r.roll_id),
  lab: str(r.lab),
  price: r.price === null || r.price === undefined ? null : num(r.price),
  currency: str(r.currency),
  sentAt: strOrNull(r.sent_at),
  receivedAt: strOrNull(r.received_at),
  process: str(r.process) as DevJob['process'],
  scanResolution: str(r.scan_resolution),
  notes: str(r.notes)
});

const toFrame = (r: Row): RollFrame => ({
  id: str(r.id),
  rollId: str(r.roll_id),
  number: num(r.number),
  aperture: str(r.aperture),
  shutter: str(r.shutter),
  lensId: strOrNull(r.lens_id),
  shotAt: strOrNull(r.shot_at),
  location: str(r.location),
  notes: str(r.notes),
  blank: bool(r.blank),
  scanPath: strOrNull(r.scan_path)
});

const toRoll = (r: Row, devJobs: DevJob[], frames: RollFrame[]): Roll => ({
  id: str(r.id),
  name: str(r.name),
  stockId: str(r.stock_id),
  cameraId: strOrNull(r.camera_id),
  lensId: strOrNull(r.lens_id),
  exposures: num(r.exposures),
  shotIso: num(r.shot_iso),
  status: str(r.status) as RollStatus,
  loadedAt: strOrNull(r.loaded_at),
  finishedAt: strOrNull(r.finished_at),
  expiryAt: strOrNull(r.expiry_at),
  notes: str(r.notes),
  scanFolder: strOrNull(r.scan_folder),
  createdAt: num(r.created_at),
  updatedAt: num(r.updated_at),
  devJobs,
  frames
});

const groupBy = <T extends { rollId: string }>(items: T[]): Map<string, T[]> => {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const list = map.get(item.rollId);
    if (list) {
      list.push(item);
    } else {
      map.set(item.rollId, [item]);
    }
  }
  return map;
};

export const readSnapshot = (filePath: string): RollsSnapshot => {
  const db = getAppDatabase(filePath);
  const devJobs = groupBy(
    rows(db, "SELECT * FROM dev_jobs ORDER BY COALESCE(sent_at, received_at, '') DESC").map(
      toDevJob
    )
  );
  const frames = groupBy(rows(db, 'SELECT * FROM roll_frames ORDER BY number ASC').map(toFrame));
  return {
    stocks: rows(
      db,
      'SELECT * FROM film_stocks ORDER BY brand COLLATE NOCASE, name COLLATE NOCASE'
    ).map(toStock),
    cameras: rows(
      db,
      'SELECT * FROM cameras ORDER BY brand COLLATE NOCASE, model COLLATE NOCASE'
    ).map(toCamera),
    lenses: rows(db, 'SELECT * FROM lenses ORDER BY name COLLATE NOCASE').map(toLens),
    rolls: rows(db, 'SELECT * FROM rolls ORDER BY updated_at DESC').map((r) =>
      toRoll(r, devJobs.get(str(r.id)) ?? [], frames.get(str(r.id)) ?? [])
    )
  };
};

// ---- Gear -----------------------------------------------------------------

export type GearInput =
  | { kind: 'stock'; value: Partial<FilmStock> }
  | { kind: 'camera'; value: Partial<Camera> }
  | { kind: 'lens'; value: Partial<Lens> };

/** Create (no id) or update (id) a stock, camera, or lens. Returns its id. */
export const saveGear = (filePath: string, input: GearInput): string => {
  const db = getAppDatabase(filePath);
  const id = input.value.id ?? randomUUID();
  const exists = input.value.id !== undefined;

  if (input.kind === 'stock') {
    const v = input.value;
    if (exists) {
      db.prepare(
        `UPDATE film_stocks SET brand = ?, name = ?, iso = ?, format = ?, exposures = ?, process = ?, type = ? WHERE id = ?`
      ).run(
        v.brand ?? '',
        v.name ?? '',
        v.iso ?? 400,
        v.format ?? '135',
        v.exposures ?? 36,
        v.process ?? 'c41',
        v.type ?? 'color-negative',
        id
      );
    } else {
      db.prepare(
        `INSERT INTO film_stocks (id, brand, name, iso, format, exposures, process, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id,
        v.brand ?? '',
        v.name ?? '',
        v.iso ?? 400,
        v.format ?? '135',
        v.exposures ?? 36,
        v.process ?? 'c41',
        v.type ?? 'color-negative'
      );
    }
  } else if (input.kind === 'camera') {
    const v = input.value;
    if (exists) {
      db.prepare('UPDATE cameras SET brand = ?, model = ?, format = ?, notes = ? WHERE id = ?').run(
        v.brand ?? '',
        v.model ?? '',
        v.format ?? '135',
        v.notes ?? '',
        id
      );
    } else {
      db.prepare(
        'INSERT INTO cameras (id, brand, model, format, notes) VALUES (?, ?, ?, ?, ?)'
      ).run(id, v.brand ?? '', v.model ?? '', v.format ?? '135', v.notes ?? '');
    }
  } else {
    const v = input.value;
    if (exists) {
      db.prepare(
        'UPDATE lenses SET name = ?, focal_length = ?, max_aperture = ?, mount = ? WHERE id = ?'
      ).run(v.name ?? '', v.focalLength ?? '', v.maxAperture ?? '', v.mount ?? '', id);
    } else {
      db.prepare(
        'INSERT INTO lenses (id, name, focal_length, max_aperture, mount) VALUES (?, ?, ?, ?, ?)'
      ).run(id, v.name ?? '', v.focalLength ?? '', v.maxAperture ?? '', v.mount ?? '');
    }
  }
  return id;
};

const GEAR_TABLE: Record<GearKind, string> = {
  stock: 'film_stocks',
  camera: 'cameras',
  lens: 'lenses'
};

/** Gear is archived, never deleted: rolls that used it keep showing it. */
export const archiveGear = (filePath: string, kind: GearKind, id: string, archived: boolean) => {
  getAppDatabase(filePath)
    .prepare(`UPDATE ${GEAR_TABLE[kind]} SET archived = ? WHERE id = ?`)
    .run(archived ? 1 : 0, id);
};

// ---- Rolls ----------------------------------------------------------------

const insertFrames = (db: DatabaseSync, rollId: string, from: number, to: number) => {
  const insert = db.prepare('INSERT INTO roll_frames (id, roll_id, number) VALUES (?, ?, ?)');
  for (let number = from; number <= to; number += 1) {
    insert.run(randomUUID(), rollId, number);
  }
};

export type CreateRollInput = {
  stockId: string;
  cameraId?: string | null;
  lensId?: string | null;
  name?: string;
  quantity?: number;
};

/** Creates `quantity` rolls (default 1) of one stock. Frames are generated from the exposure count. */
export const createRolls = (
  filePath: string,
  input: CreateRollInput,
  now = new Date()
): string[] => {
  const db = getAppDatabase(filePath);
  const stock = rows(db, 'SELECT * FROM film_stocks WHERE id = ?', input.stockId)[0];
  if (!stock) {
    throw new Error('Film stock not found');
  }
  const quantity = Math.max(1, Math.min(50, Math.floor(input.quantity ?? 1)));
  const year = now.getFullYear();
  const yearPrefix = `${year}-%`;
  const existing = num(
    rows(db, 'SELECT COUNT(*) AS count FROM rolls WHERE name LIKE ?', yearPrefix)[0]?.count
  );
  const ids: string[] = [];

  db.exec('BEGIN');
  try {
    for (let i = 0; i < quantity; i += 1) {
      const id = randomUUID();
      const name =
        input.name?.trim() && quantity === 1
          ? input.name.trim()
          : defaultRollName(year, existing + i);
      const stamp = now.getTime();
      db.prepare(
        `INSERT INTO rolls (id, name, stock_id, camera_id, lens_id, exposures, shot_iso, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'unused', ?, ?)`
      ).run(
        id,
        name,
        input.stockId,
        input.cameraId ?? null,
        input.lensId ?? null,
        num(stock.exposures),
        num(stock.iso),
        stamp,
        stamp
      );
      insertFrames(db, id, 1, num(stock.exposures));
      ids.push(id);
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  return ids;
};

const ROLL_PATCH_COLUMNS = {
  name: 'name',
  stockId: 'stock_id',
  cameraId: 'camera_id',
  lensId: 'lens_id',
  shotIso: 'shot_iso',
  loadedAt: 'loaded_at',
  finishedAt: 'finished_at',
  expiryAt: 'expiry_at',
  notes: 'notes',
  scanFolder: 'scan_folder'
} as const;

export type { RollPatch };

const syncFrameCount = (db: DatabaseSync, rollId: string, exposures: number) => {
  const current = num(
    rows(db, 'SELECT COALESCE(MAX(number), 0) AS max FROM roll_frames WHERE roll_id = ?', rollId)[0]
      ?.max
  );
  if (exposures > current) {
    insertFrames(db, rollId, current + 1, exposures);
  }
};

/** Only whitelisted columns are written, so patch keys never reach the SQL text. */
export const updateRoll = (
  filePath: string,
  rollId: string,
  patch: RollPatch,
  now = new Date()
) => {
  const db = getAppDatabase(filePath);
  const sets: string[] = [];
  const values: SQLInputValue[] = [];
  for (const [key, column] of Object.entries(ROLL_PATCH_COLUMNS)) {
    if (key in patch) {
      sets.push(`${column} = ?`);
      values.push(patch[key as keyof typeof ROLL_PATCH_COLUMNS] ?? null);
    }
  }
  if (patch.exposures !== undefined) {
    sets.push('exposures = ?');
    values.push(patch.exposures);
    syncFrameCount(db, rollId, patch.exposures);
  }
  if (sets.length === 0) {
    return;
  }
  sets.push('updated_at = ?');
  db.prepare(`UPDATE rolls SET ${sets.join(', ')} WHERE id = ?`).run(
    ...values,
    now.getTime(),
    rollId
  );
};

const toIsoDay = (date: Date): string => date.toISOString().slice(0, 10);

/** Sets a status and stamps the matching entry date (if the roll has none yet). */
export const setRollStatus = (
  filePath: string,
  rollId: string,
  status: RollStatus,
  now = new Date()
) => {
  const db = getAppDatabase(filePath);
  const dateField = STATUS_ENTRY_DATE[status];
  db.prepare('UPDATE rolls SET status = ?, updated_at = ? WHERE id = ?').run(
    status,
    now.getTime(),
    rollId
  );
  if (dateField) {
    const column = ROLL_PATCH_COLUMNS[dateField];
    db.prepare(`UPDATE rolls SET ${column} = COALESCE(${column}, ?) WHERE id = ?`).run(
      toIsoDay(now),
      rollId
    );
  }
};

/** Deleting a roll only removes records (dev jobs and frames cascade); scan files are never touched. */
export const deleteRoll = (filePath: string, rollId: string) => {
  getAppDatabase(filePath).prepare('DELETE FROM rolls WHERE id = ?').run(rollId);
};

// ---- Dev jobs -------------------------------------------------------------

export type DevJobInput = Partial<Omit<DevJob, 'rollId'>> & { rollId: string };

export const saveDevJob = (filePath: string, input: DevJobInput, now = new Date()): string => {
  const db = getAppDatabase(filePath);
  const id = input.id ?? randomUUID();
  const roll = rows(
    db,
    'SELECT s.process FROM rolls r JOIN film_stocks s ON s.id = r.stock_id WHERE r.id = ?',
    input.rollId
  )[0];
  if (!roll) {
    throw new Error('Roll not found');
  }
  const values = [
    input.lab ?? '',
    input.price ?? null,
    input.currency || DEFAULT_CURRENCY,
    input.sentAt ?? null,
    input.receivedAt ?? null,
    input.process ?? str(roll.process),
    input.scanResolution ?? '',
    input.notes ?? ''
  ];
  if (input.id) {
    db.prepare(
      `UPDATE dev_jobs SET lab = ?, price = ?, currency = ?, sent_at = ?, received_at = ?, process = ?, scan_resolution = ?, notes = ? WHERE id = ?`
    ).run(...values, id);
  } else {
    db.prepare(
      `INSERT INTO dev_jobs (lab, price, currency, sent_at, received_at, process, scan_resolution, notes, id, roll_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(...values, id, input.rollId);
  }
  db.prepare('UPDATE rolls SET updated_at = ? WHERE id = ?').run(now.getTime(), input.rollId);
  return id;
};

export const deleteDevJob = (filePath: string, id: string) => {
  getAppDatabase(filePath).prepare('DELETE FROM dev_jobs WHERE id = ?').run(id);
};

// ---- Frames ---------------------------------------------------------------

const FRAME_PATCH_COLUMNS = {
  aperture: 'aperture',
  shutter: 'shutter',
  lensId: 'lens_id',
  shotAt: 'shot_at',
  location: 'location',
  notes: 'notes',
  blank: 'blank',
  scanPath: 'scan_path'
} as const;

export type FramePatch = Partial<Pick<RollFrame, keyof typeof FRAME_PATCH_COLUMNS>>;

/** Applies one patch to several frames, for bulk edit in the inspector. */
export const updateFrames = (filePath: string, frameIds: string[], patch: FramePatch) => {
  const db = getAppDatabase(filePath);
  const sets: string[] = [];
  const values: SQLInputValue[] = [];
  for (const [key, column] of Object.entries(FRAME_PATCH_COLUMNS)) {
    if (key in patch) {
      const value = patch[key as keyof FramePatch];
      sets.push(`${column} = ?`);
      values.push(typeof value === 'boolean' ? (value ? 1 : 0) : (value ?? null));
    }
  }
  if (sets.length === 0) {
    return;
  }
  const statement = db.prepare(`UPDATE roll_frames SET ${sets.join(', ')} WHERE id = ?`);
  for (const id of frameIds) {
    statement.run(...values, id);
  }
};

/** Adds one frame past the current last number. */
export const addFrame = (filePath: string, rollId: string): string => {
  const db = getAppDatabase(filePath);
  const max = num(
    rows(db, 'SELECT COALESCE(MAX(number), 0) AS max FROM roll_frames WHERE roll_id = ?', rollId)[0]
      ?.max
  );
  const id = randomUUID();
  db.prepare('INSERT INTO roll_frames (id, roll_id, number) VALUES (?, ?, ?)').run(
    id,
    rollId,
    max + 1
  );
  return id;
};

/** Removes the last frame, but only when it has no scan and no details. Returns whether it was removed. */
export const removeLastFrame = (filePath: string, rollId: string): boolean => {
  const db = getAppDatabase(filePath);
  const last = rows(
    db,
    'SELECT * FROM roll_frames WHERE roll_id = ? ORDER BY number DESC LIMIT 1',
    rollId
  )[0];
  if (!last) {
    return false;
  }
  const frame = toFrame(last);
  if (!isFrameEmpty(frame)) {
    return false;
  }
  db.prepare('DELETE FROM roll_frames WHERE id = ?').run(frame.id);
  return true;
};

// ---- Scans ----------------------------------------------------------------

/**
 * Links a folder of scans to a roll. `paths` are in frame order; frame 1 gets `paths[0]`, and so on.
 * Any previous links are cleared. With `addFrames`, frames are added so every file has one.
 * Read-only on disk: only database rows change.
 */
export const linkScans = (
  filePath: string,
  rollId: string,
  folder: string,
  paths: string[],
  addFrames: boolean,
  now = new Date()
) => {
  const db = getAppDatabase(filePath);
  db.exec('BEGIN');
  try {
    if (addFrames) {
      const count = num(
        rows(db, 'SELECT COUNT(*) AS count FROM roll_frames WHERE roll_id = ?', rollId)[0]?.count
      );
      if (paths.length > count) {
        insertFrames(db, rollId, count + 1, paths.length);
        db.prepare('UPDATE rolls SET exposures = MAX(exposures, ?) WHERE id = ?').run(
          paths.length,
          rollId
        );
      }
    }
    const frames = rows(
      db,
      'SELECT id FROM roll_frames WHERE roll_id = ? ORDER BY number ASC',
      rollId
    );
    db.prepare('UPDATE roll_frames SET scan_path = NULL WHERE roll_id = ?').run(rollId);
    const assign = db.prepare('UPDATE roll_frames SET scan_path = ? WHERE id = ?');
    frames
      .slice(0, paths.length)
      .forEach((frame, index) => assign.run(paths[index], str(frame.id)));
    db.prepare('UPDATE rolls SET scan_folder = ?, updated_at = ? WHERE id = ?').run(
      folder,
      now.getTime(),
      rollId
    );
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

/** Forgets the linked folder and every frame's scan. Files on disk are untouched. */
export const unlinkScans = (filePath: string, rollId: string, now = new Date()) => {
  const db = getAppDatabase(filePath);
  db.exec('BEGIN');
  try {
    db.prepare('UPDATE roll_frames SET scan_path = NULL WHERE roll_id = ?').run(rollId);
    db.prepare('UPDATE rolls SET scan_folder = NULL, updated_at = ? WHERE id = ?').run(
      now.getTime(),
      rollId
    );
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

/** Drags a scan onto another frame of the same roll: moves it, or swaps if the target already has one. */
export const moveFrameScan = (filePath: string, fromFrameId: string, toFrameId: string) => {
  const db = getAppDatabase(filePath);
  const [from] = rows(db, 'SELECT roll_id, scan_path FROM roll_frames WHERE id = ?', fromFrameId);
  const [to] = rows(db, 'SELECT roll_id, scan_path FROM roll_frames WHERE id = ?', toFrameId);
  if (!from || !to || from.roll_id !== to.roll_id) {
    throw new Error('Frames must belong to the same roll');
  }
  const update = db.prepare('UPDATE roll_frames SET scan_path = ? WHERE id = ?');
  db.exec('BEGIN');
  try {
    update.run(strOrNull(to.scan_path), fromFrameId);
    update.run(strOrNull(from.scan_path), toFrameId);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

/** Which of a roll's linked folder and scan files no longer exist on disk. */
export const checkRollScans = (filePath: string, rollId: string): RollScanStatus => {
  const db = getAppDatabase(filePath);
  const [roll] = rows(db, 'SELECT scan_folder FROM rolls WHERE id = ?', rollId);
  const folder = strOrNull(roll?.scan_folder);
  const scanPaths = rows(
    db,
    'SELECT scan_path FROM roll_frames WHERE roll_id = ? AND scan_path IS NOT NULL',
    rollId
  );
  return {
    folderMissing: folder !== null && !existsSync(folder),
    missingPaths: scanPaths.map((r) => str(r.scan_path)).filter((path) => !existsSync(path))
  };
};
