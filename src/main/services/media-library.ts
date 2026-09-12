import { readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';

import { readImageDimensions } from './image-dimensions';

export type DiskEntry = {
  id: string;
  name: string;
  path: string;
  hasChildren: boolean;
};

export type FolderEntry = DiskEntry;

export type FileEntry = {
  id: string;
  name: string;
  path: string;
  createdAt: string;
  size: number;
  width: number;
  height: number;
};

export type FolderListing = {
  folders: FolderEntry[];
  files: FileEntry[];
};

const RAW_IMAGE_EXTENSIONS = new Set([
  '.dng',
  '.raw',
  '.cr2',
  '.cr3',
  '.crw',
  '.nef',
  '.nrw',
  '.arw',
  '.srf',
  '.sr2',
  '.raf',
  '.orf',
  '.rw2',
  '.pef',
  '.srw',
  '.x3f',
  '.3fr',
  '.erf',
  '.mef',
  '.mrw',
  '.kdc',
  '.dcr',
  '.iiq',
  '.rwl'
]);

const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.jpe',
  '.jfif',
  '.png',
  '.gif',
  '.webp',
  '.tif',
  '.tiff',
  '.bmp',
  '.avif',
  '.heic',
  '.heif',
  ...RAW_IMAGE_EXTENSIONS
]);

const isHidden = (name: string) => name.startsWith('.');

const isImageFile = (name: string) => IMAGE_EXTENSIONS.has(extname(name).toLowerCase());

export const isRawImageFile = (filePath: string) =>
  RAW_IMAGE_EXTENSIONS.has(extname(filePath).toLowerCase());

const hasSubdirectories = async (dirPath: string): Promise<boolean> => {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    return entries.some((entry) => entry.isDirectory() && !isHidden(entry.name));
  } catch {
    return false;
  }
};

const listVolumesDarwin = async (): Promise<DiskEntry[]> => {
  try {
    const entries = await readdir('/Volumes', { withFileTypes: true });
    return await Promise.all(
      entries
        .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
        .map(async (entry) => {
          const path = join('/Volumes', entry.name);
          return { id: path, name: entry.name, path, hasChildren: await hasSubdirectories(path) };
        })
    );
  } catch {
    return [];
  }
};

const listVolumesWin32 = async (): Promise<DiskEntry[]> => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const disks: DiskEntry[] = [];
  for (const letter of letters) {
    const path = `${letter}:\\`;
    try {
      await readdir(path);
      disks.push({
        id: path,
        name: `${letter}:`,
        path,
        hasChildren: await hasSubdirectories(path)
      });
    } catch {
      // Drive not present, skip.
    }
  }
  return disks;
};

const listVolumesFallback = async (): Promise<DiskEntry[]> => {
  const home = process.env.HOME ?? '/';
  return [{ id: home, name: 'Home', path: home, hasChildren: await hasSubdirectories(home) }];
};

export const listVolumes = async (): Promise<DiskEntry[]> => {
  if (process.platform === 'darwin') {
    return listVolumesDarwin();
  }
  if (process.platform === 'win32') {
    return listVolumesWin32();
  }
  return listVolumesFallback();
};

const createdAtFromStat = (fileStat: { birthtimeMs: number; birthtime: Date; mtime: Date }) =>
  (fileStat.birthtimeMs > 0 ? fileStat.birthtime : fileStat.mtime).toISOString();

export const listFolder = async (dirPath: string): Promise<FolderListing> => {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    const folders = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory() && !isHidden(entry.name))
        .map(async (entry) => {
          const path = join(dirPath, entry.name);
          return { id: path, name: entry.name, path, hasChildren: await hasSubdirectories(path) };
        })
    );
    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && !isHidden(entry.name) && isImageFile(entry.name))
        .map(async (entry) => {
          const path = join(dirPath, entry.name);
          try {
            const [fileStat, dimensions] = await Promise.all([
              stat(path),
              readImageDimensions(path)
            ]);
            return {
              id: path,
              name: entry.name,
              path,
              createdAt: createdAtFromStat(fileStat),
              size: fileStat.size,
              width: dimensions.width,
              height: dimensions.height
            };
          } catch {
            return {
              id: path,
              name: entry.name,
              path,
              createdAt: '',
              size: 0,
              width: 0,
              height: 0
            };
          }
        })
    );
    return {
      folders: folders.sort((a, b) => a.name.localeCompare(b.name)),
      files: files.sort((a, b) => a.name.localeCompare(b.name))
    };
  } catch {
    return { folders: [], files: [] };
  }
};
