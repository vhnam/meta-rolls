import { stat } from 'node:fs/promises';

import { BinaryField, ExifDate, ExifDateTime, ExifTime, ExifTool } from 'exiftool-vendored';

import {
  type PhotoExif,
  type PhotoExifField,
  type PhotoRotateDirection
} from '../../../shared/media';

const exiftool = new ExifTool({ maxProcs: 2 });
const PREVIEW_TAGS = ['PreviewImage', 'JpgFromRaw', 'OtherImage', 'ThumbnailImage'] as const;
const PREVIEW_CACHE_LIMIT = 8;

type CachedPreview = {
  mtimeMs: number;
  buffer: Buffer;
};

const previewCache = new Map<string, CachedPreview>();
const inflightPreviews = new Map<string, Promise<Buffer | null>>();

const isJpeg = (buffer: Buffer) => buffer.length > 2 && buffer[0] === 0xff && buffer[1] === 0xd8;

const rememberPreview = (filePath: string, mtimeMs: number, buffer: Buffer) => {
  previewCache.delete(filePath);
  previewCache.set(filePath, { mtimeMs, buffer });
  if (previewCache.size > PREVIEW_CACHE_LIMIT) {
    const oldest = previewCache.keys().next().value;
    if (oldest) {
      previewCache.delete(oldest);
    }
  }
};

const extractPreviewBuffer = async (filePath: string, mtimeMs: number): Promise<Buffer | null> => {
  for (const tag of PREVIEW_TAGS) {
    try {
      const buffer = await exiftool.extractBinaryTagToBuffer(tag, filePath);
      if (isJpeg(buffer)) {
        rememberPreview(filePath, mtimeMs, buffer);
        return buffer;
      }
    } catch {
      continue;
    }
  }
  return null;
};

export const extractRawPreviewJpeg = async (filePath: string): Promise<Buffer | null> => {
  const mtimeMs = (await stat(filePath)).mtimeMs;
  const cached = previewCache.get(filePath);
  if (cached && cached.mtimeMs === mtimeMs) {
    return cached.buffer;
  }

  const pending = inflightPreviews.get(filePath);
  if (pending) {
    return pending;
  }

  const request = extractPreviewBuffer(filePath, mtimeMs).finally(() => {
    inflightPreviews.delete(filePath);
  });
  inflightPreviews.set(filePath, request);
  return request;
};

const SKIP_KEYS = new Set([
  'SourceFile',
  'errors',
  'warnings',
  'zone',
  'tz',
  'tzSource',
  'zoneSource',
  'invalidUtf8Bytes'
]);

const formatValue = (value: unknown): string | null => {
  if (value == null || value instanceof BinaryField) {
    return null;
  }
  if (value instanceof Uint8Array || Buffer.isBuffer(value)) {
    return null;
  }
  if (value instanceof ExifDateTime) {
    return value.toISOString() ?? value.toExifString() ?? null;
  }
  if (value instanceof ExifDate || value instanceof ExifTime) {
    return value.toString() ?? null;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const text = String(value).trim();
    return text.length > 0 ? text : null;
  }
  if (Array.isArray(value)) {
    const parts = value.map(formatValue).filter((part): part is string => part !== null);
    return parts.length > 0 ? parts.join(', ') : null;
  }
  if (typeof value === 'object') {
    try {
      const json = JSON.stringify(value);
      return json && json !== '{}' ? json : null;
    } catch {
      return null;
    }
  }
  return null;
};

const toPositiveInt = (value: unknown): number => {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric) : 0;
};

export const readExifImageDimensions = async (
  filePath: string
): Promise<{ width: number; height: number }> => {
  try {
    const tags = await exiftool.read(filePath, [
      '-fast2',
      '-n',
      '-ImageWidth',
      '-ImageHeight',
      '-ExifImageWidth',
      '-ExifImageHeight'
    ]);
    return {
      width: toPositiveInt(tags.ImageWidth) || toPositiveInt(tags.ExifImageWidth),
      height: toPositiveInt(tags.ImageHeight) || toPositiveInt(tags.ExifImageHeight)
    };
  } catch {
    return { width: 0, height: 0 };
  }
};

export const readPhotoExif = async (filePath: string): Promise<PhotoExif | null> => {
  try {
    const tags = await exiftool.read(filePath, { groupNames: true });
    const fields = Object.entries(tags as Record<string, unknown>)
      .flatMap(([label, raw]): PhotoExifField[] => {
        if (SKIP_KEYS.has(label) || label.endsWith(':Error') || label.endsWith(':Warning')) {
          return [];
        }
        const value = formatValue(raw);
        return value ? [{ label, value }] : [];
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    return fields.length > 0 ? { fields } : null;
  } catch {
    return null;
  }
};

const EXIF_ORIENTATION = {
  1: { cw: 6, ccw: 8 },
  2: { cw: 5, ccw: 7 },
  3: { cw: 8, ccw: 6 },
  4: { cw: 7, ccw: 5 },
  5: { cw: 4, ccw: 2 },
  6: { cw: 3, ccw: 1 },
  7: { cw: 2, ccw: 4 },
  8: { cw: 1, ccw: 3 }
} as const;

export type RotatedImage = {
  mtimeMs: number;
};

export const readImageOrientation = async (filePath: string) => {
  try {
    const tags = await exiftool.read(filePath, ['-n', '-Orientation']);
    const current = toPositiveInt(tags.Orientation);
    return current >= 1 && current <= 8 ? current : 1;
  } catch {
    return 1;
  }
};

export const rotateImage = async (
  filePath: string,
  direction: PhotoRotateDirection
): Promise<RotatedImage> => {
  const orientation = await readImageOrientation(filePath);
  const next = EXIF_ORIENTATION[orientation as keyof typeof EXIF_ORIENTATION][direction];
  try {
    await exiftool.write(filePath, { Orientation: next }, [
      '-overwrite_original_in_place',
      '-n',
      '-m'
    ]);
  } catch {
    await exiftool.write(filePath, { Orientation: next }, ['-overwrite_original', '-n', '-m']);
  }
  previewCache.delete(filePath);
  return { mtimeMs: (await stat(filePath)).mtimeMs };
};

export const endExifTool = () => exiftool.end();
