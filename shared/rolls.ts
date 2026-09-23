export const ROLL_STATUSES = ['unused', 'loaded', 'shot', 'developing', 'developed'] as const;
export type RollStatus = (typeof ROLL_STATUSES)[number];

export const isRollStatus = (value: unknown): value is RollStatus =>
  typeof value === 'string' && (ROLL_STATUSES as readonly string[]).includes(value);

export type FilmFormat = '135' | '120' | '4x5' | 'other';
export type FilmProcess = 'c41' | 'e6' | 'bw';
export type FilmType = 'color-negative' | 'slide' | 'bw';

export const FILM_FORMATS: readonly FilmFormat[] = ['135', '120', '4x5', 'other'];
export const FILM_PROCESSES: readonly FilmProcess[] = ['c41', 'e6', 'bw'];
export const FILM_TYPES: readonly FilmType[] = ['color-negative', 'slide', 'bw'];

export type FilmStock = {
  id: string;
  brand: string;
  name: string;
  iso: number;
  format: FilmFormat;
  exposures: number;
  process: FilmProcess;
  type: FilmType;
  archived: boolean;
};

export type Camera = {
  id: string;
  brand: string;
  model: string;
  format: FilmFormat;
  notes: string;
  archived: boolean;
};

export type Lens = {
  id: string;
  name: string;
  focalLength: string;
  maxAperture: string;
  mount: string;
  archived: boolean;
};

export type DevJob = {
  id: string;
  rollId: string;
  lab: string;
  price: number | null;
  currency: string;
  sentAt: string | null;
  receivedAt: string | null;
  process: FilmProcess;
  scanResolution: string;
  notes: string;
};

export type RollFrame = {
  id: string;
  rollId: string;
  number: number;
  aperture: string;
  shutter: string;
  lensId: string | null;
  shotAt: string | null;
  location: string;
  notes: string;
  blank: boolean;
  scanPath: string | null;
};

export type Roll = {
  id: string;
  name: string;
  stockId: string;
  cameraId: string | null;
  lensId: string | null;
  exposures: number;
  shotIso: number;
  status: RollStatus;
  loadedAt: string | null;
  finishedAt: string | null;
  expiryAt: string | null;
  notes: string;
  scanFolder: string | null;
  createdAt: number;
  updatedAt: number;
  devJobs: DevJob[];
  frames: RollFrame[];
};

export type RollsSnapshot = {
  stocks: FilmStock[];
  cameras: Camera[];
  lenses: Lens[];
  rolls: Roll[];
};

export type GearKind = 'stock' | 'camera' | 'lens';

export const DEFAULT_CURRENCY = 'VND';

/** Which roll date is stamped when a roll enters a status (dev-job dates are stamped elsewhere). */
export const STATUS_ENTRY_DATE: Record<RollStatus, 'loadedAt' | 'finishedAt' | null> = {
  unused: null,
  loaded: 'loadedAt',
  shot: 'finishedAt',
  developing: null,
  developed: null
};

/** The next step offered by the status control, or null once the roll is developed. */
export const nextRollStatus = (status: RollStatus): RollStatus | null => {
  const index = ROLL_STATUSES.indexOf(status);
  return ROLL_STATUSES[index + 1] ?? null;
};

/** Stops pushed (+) or pulled (-) when a roll is shot at a different ISO than the stock's rating. */
export const pushPullStops = (stockIso: number, shotIso: number): number => {
  if (!(stockIso > 0) || !(shotIso > 0)) {
    return 0;
  }
  return Math.round(Math.log2(shotIso / stockIso) * 100) / 100;
};

export const formatPushPull = (stops: number): string | null => {
  if (stops === 0) {
    return null;
  }
  const abs = Math.abs(stops);
  return `${stops > 0 ? '+' : '-'}${abs} ${stops > 0 ? 'push' : 'pull'}`;
};

/** Default roll name: `<year>-<running number, 3 digits>`, e.g. `2026-014`. */
export const defaultRollName = (year: number, existingCount: number): string =>
  `${year}-${String(existingCount + 1).padStart(3, '0')}`;

export const isFormatMismatch = (stockFormat: FilmFormat, cameraFormat: FilmFormat): boolean =>
  stockFormat !== cameraFormat;

/** Whole days between today and an expiry date; negative when already expired. Null when unset. */
export const daysUntilExpiry = (expiryAt: string | null, now: Date): number | null => {
  if (!expiryAt) {
    return null;
  }
  const expiry = Date.parse(expiryAt);
  if (Number.isNaN(expiry)) {
    return null;
  }
  return Math.ceil((expiry - now.getTime()) / 86_400_000);
};

/** Fields of a roll that can be edited in place (frames and dev jobs have their own calls). */
export type RollPatch = Partial<
  Pick<
    Roll,
    | 'name'
    | 'stockId'
    | 'cameraId'
    | 'lensId'
    | 'exposures'
    | 'shotIso'
    | 'loadedAt'
    | 'finishedAt'
    | 'expiryAt'
    | 'notes'
    | 'scanFolder'
  >
>;

/** A frame with no scan and no shot details; only these may be removed from the end of a roll. */
export const isFrameEmpty = (frame: RollFrame): boolean =>
  frame.scanPath === null &&
  !frame.aperture &&
  !frame.shutter &&
  !frame.lensId &&
  !frame.shotAt &&
  !frame.location &&
  !frame.notes;

/** Filename order used to match scan files to frames: `2.jpg` before `10.jpg`. */
export const compareScanNames = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

export type ScanLinkPlan = {
  /** Files matched to frames, in frame order. */
  pairs: { frameNumber: number; frameId: string; path: string; name: string }[];
  /** Files left over when there are more files than frames. */
  extraFiles: { path: string; name: string }[];
  /** Numbers of frames left without a file when there are more frames than files. */
  emptyFrameNumbers: number[];
};

/** Matches files to frames one-to-one in filename order, reporting whatever doesn't line up. */
export const planScanLink = (
  files: { path: string; name: string }[],
  frames: { id: string; number: number }[]
): ScanLinkPlan => {
  const sortedFiles = [...files].sort((a, b) => compareScanNames(a.name, b.name));
  const sortedFrames = [...frames].sort((a, b) => a.number - b.number);
  const matched = Math.min(sortedFiles.length, sortedFrames.length);
  return {
    pairs: sortedFrames.slice(0, matched).map((frame, index) => ({
      frameNumber: frame.number,
      frameId: frame.id,
      path: sortedFiles[index].path,
      name: sortedFiles[index].name
    })),
    extraFiles: sortedFiles.slice(matched),
    emptyFrameNumbers: sortedFrames.slice(matched).map((frame) => frame.number)
  };
};

export type RollScanStatus = {
  folderMissing: boolean;
  missingPaths: string[];
};

/** The roll and frame a scan file is linked to, if any. */
export const findFrameByScanPath = (
  rolls: Roll[],
  path: string
): { roll: Roll; frame: RollFrame } | null => {
  for (const roll of rolls) {
    const frame = roll.frames.find((item) => item.scanPath === path);
    if (frame) {
      return { roll, frame };
    }
  }
  return null;
};

/** Header line above the roll list, e.g. "3 loaded · 2 at lab · 14 unused". Empty when nothing to report. */
export const summarizeRolls = (rolls: Roll[]): string => {
  const count = (status: RollStatus) => rolls.filter((roll) => roll.status === status).length;
  const parts: [number, string][] = [
    [count('loaded'), 'loaded'],
    [count('developing'), 'at lab'],
    [count('unused'), 'unused']
  ];
  return parts
    .filter(([n]) => n > 0)
    .map(([n, label]) => `${n} ${label}`)
    .join(' · ');
};

/** Whether an unused roll's expiry needs a warning: past, or within `withinDays`. */
export const isExpiryWarning = (roll: Roll, now: Date, withinDays = 30): boolean => {
  if (roll.status !== 'unused') {
    return false;
  }
  const days = daysUntilExpiry(roll.expiryAt, now);
  return days !== null && days <= withinDays;
};

export type LabSummary = {
  lab: string;
  jobs: number;
  /** Total spent per currency; prices in different currencies are never added together. */
  spent: Record<string, number>;
  /** Average days from sent to received, over jobs with both dates. Null if none. */
  averageDays: number | null;
};

const DAY_MS = 86_400_000;

/** Per-lab totals and turnaround across all rolls. Jobs without a lab name are skipped. */
export const summarizeLabs = (rolls: Roll[]): LabSummary[] => {
  const byLab = new Map<string, { jobs: number; spent: Record<string, number>; days: number[] }>();
  for (const job of rolls.flatMap((roll) => roll.devJobs)) {
    const lab = job.lab.trim();
    if (!lab) {
      continue;
    }
    const entry = byLab.get(lab) ?? { jobs: 0, spent: {}, days: [] };
    entry.jobs += 1;
    if (job.price !== null) {
      entry.spent[job.currency] = (entry.spent[job.currency] ?? 0) + job.price;
    }
    if (job.sentAt && job.receivedAt) {
      const days = (Date.parse(job.receivedAt) - Date.parse(job.sentAt)) / DAY_MS;
      if (Number.isFinite(days) && days >= 0) {
        entry.days.push(days);
      }
    }
    byLab.set(lab, entry);
  }
  return [...byLab.entries()]
    .map(([lab, entry]) => ({
      lab,
      jobs: entry.jobs,
      spent: entry.spent,
      averageDays: entry.days.length
        ? Math.round(entry.days.reduce((a, b) => a + b, 0) / entry.days.length)
        : null
    }))
    .sort((a, b) => b.jobs - a.jobs || a.lab.localeCompare(b.lab));
};
