import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rename, rm, stat, utimes, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const CACHE_DIR_NAME = 'thumbnails';
// A rough cap on how many resized JPEGs live on disk at once — generous
// enough for a large library's grid view, small enough to not grow forever.
const MAX_CACHE_ENTRIES = 2000;

const cacheDir = (userDataPath: string) => join(userDataPath, CACHE_DIR_NAME);

const cacheKey = (filePath: string, mtimeMs: number, width: number) =>
  createHash('sha256').update(`${filePath}\u0000${mtimeMs}\u0000${width}`).digest('hex');

const cacheFilePath = (userDataPath: string, filePath: string, mtimeMs: number, width: number) =>
  join(cacheDir(userDataPath), `${cacheKey(filePath, mtimeMs, width)}.jpg`);

export const readThumbnailCache = async (
  userDataPath: string,
  filePath: string,
  mtimeMs: number,
  width: number
): Promise<Buffer | null> => {
  const target = cacheFilePath(userDataPath, filePath, mtimeMs, width);
  try {
    const buffer = await readFile(target);
    // mtime doubles as an access-time proxy for eviction below.
    const now = new Date();
    void utimes(target, now, now).catch(() => {});
    return buffer;
  } catch {
    return null;
  }
};

export const writeThumbnailCache = async (
  userDataPath: string,
  filePath: string,
  mtimeMs: number,
  width: number,
  body: Buffer
): Promise<void> => {
  const dir = cacheDir(userDataPath);
  const target = cacheFilePath(userDataPath, filePath, mtimeMs, width);
  const tempPath = `${target}.${process.pid}.tmp`;
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(tempPath, body);
    await rename(tempPath, target);
  } catch {
    return;
  }
  void pruneThumbnailCache(userDataPath);
};

// Caps the on-disk thumbnail cache by entry count, evicting the
// least-recently-read files first (readThumbnailCache touches mtime on
// every hit, so it works as an access-time proxy). Runs in the background
// after a write completes rather than blocking the response.
const pruneThumbnailCache = async (userDataPath: string): Promise<void> => {
  const dir = cacheDir(userDataPath);
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return;
  }
  if (entries.length <= MAX_CACHE_ENTRIES) {
    return;
  }

  const stats = await Promise.all(
    entries.map(async (name) => {
      try {
        const fileStat = await stat(join(dir, name));
        return { name, mtimeMs: fileStat.mtimeMs };
      } catch {
        return null;
      }
    })
  );
  const alive = stats.filter((entry): entry is { name: string; mtimeMs: number } => entry !== null);
  alive.sort((a, b) => a.mtimeMs - b.mtimeMs);

  const excess = alive.length - MAX_CACHE_ENTRIES;
  if (excess <= 0) {
    return;
  }
  await Promise.all(
    alive
      .slice(0, excess)
      .map((entry) => rm(join(dir, entry.name), { force: true }).catch(() => {}))
  );
};
