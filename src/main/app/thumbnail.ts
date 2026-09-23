import { stat } from 'node:fs/promises';

import { app } from 'electron';

import { readImageOrientation } from '../services/exif-reader';
import { readThumbnailCache, writeThumbnailCache } from '../services/thumbnail-cache';
import { applyExifOrientation } from './apply-exif-orientation';
import { decodeSourceImage, isOrientationAlreadyBaked } from './image-decode';

// Sanity clamp on top of whatever width the renderer asks for — keeps a
// hostile/buggy caller from requesting a "thumbnail" at full resolution.
export const THUMBNAIL_MAX_WIDTH_PX = 1600;
const THUMBNAIL_JPEG_QUALITY = 82;

export type ThumbnailBytes = { mtimeMs: number; body: Buffer; mime: string };

// Several grid tiles can request the same photo at the same width at once
// (mount storms while scrolling, the same photo shown in two panes at
// once), so in-flight generation is de-duped per (path, mtime, width) key —
// the same idiom exif-reader.ts uses for RAW preview extraction.
const inflightThumbnails = new Map<string, Promise<ThumbnailBytes | null>>();

const generateThumbnail = async (
  filePath: string,
  mtimeMs: number,
  width: number,
  userDataPath: string
): Promise<ThumbnailBytes | null> => {
  const cached = await readThumbnailCache(userDataPath, filePath, mtimeMs, width);
  if (cached) {
    return { mtimeMs, body: cached, mime: 'image/jpeg' };
  }

  const source = await decodeSourceImage(filePath);
  if (!source) {
    return null;
  }

  const orientation = await readImageOrientation(filePath);
  // Resize first, at the source's native (unrotated) orientation — the pixel
  // remap below is a JS loop over every pixel and would block the main
  // process for a noticeable stretch if it ran on the full-resolution
  // bitmap instead of the already-small thumbnail. Uniform resize commutes
  // with the transpose/flip orientation applies, so doing it in this order
  // produces the same result.
  const { width: naturalWidth } = source.getSize();
  const scaled = naturalWidth > width ? source.resize({ width, quality: 'good' }) : source;
  const skipRotation =
    orientation <= 1 || (await isOrientationAlreadyBaked(filePath, source, orientation));
  const oriented = skipRotation ? scaled : applyExifOrientation(scaled, orientation);
  const body = oriented.toJPEG(THUMBNAIL_JPEG_QUALITY);

  await writeThumbnailCache(userDataPath, filePath, mtimeMs, width, body);
  return { mtimeMs, body, mime: 'image/jpeg' };
};

export const readThumbnailBytes = async (
  filePath: string,
  requestedWidth: number
): Promise<ThumbnailBytes | null> => {
  const mtimeMs = (await stat(filePath)).mtimeMs;
  const width = Math.min(Math.max(Math.round(requestedWidth), 1), THUMBNAIL_MAX_WIDTH_PX);
  const userDataPath = app.getPath('userData');
  const key = `${filePath}\u0000${mtimeMs}\u0000${width}`;

  const pending = inflightThumbnails.get(key);
  if (pending) {
    return pending;
  }

  const request = generateThumbnail(filePath, mtimeMs, width, userDataPath).finally(() => {
    inflightThumbnails.delete(key);
  });
  inflightThumbnails.set(key, request);
  return request;
};
