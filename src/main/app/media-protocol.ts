import { readFile, stat } from 'node:fs/promises';
import { extname } from 'node:path';

import { nativeImage, protocol, type NativeImage } from 'electron';

import { MEDIA_FILE_SCHEME } from '../../../shared/media';
import { extractRawPreviewJpeg, readImageOrientation } from '../services/exif-reader';
import { readImageDimensions } from '../services/image-dimensions';
import { isImageFile, isRawImageFile } from '../services/media-library';
import { applyExifOrientation } from './apply-exif-orientation';

const DISPLAY_CACHE_LIMIT = 16;

type CachedDisplay = {
  mtimeMs: number;
  body: Buffer;
  mime: string;
};

const displayCache = new Map<string, CachedDisplay>();

const mimeForPath = (filePath: string) => {
  const extension = extname(filePath).toLowerCase();
  if (extension === '.png') {
    return 'image/png';
  }
  if (extension === '.webp') {
    return 'image/webp';
  }
  if (extension === '.gif') {
    return 'image/gif';
  }
  return 'image/jpeg';
};

const rememberDisplay = (filePath: string, cached: CachedDisplay) => {
  displayCache.delete(filePath);
  displayCache.set(filePath, cached);
  if (displayCache.size > DISPLAY_CACHE_LIMIT) {
    const oldest = displayCache.keys().next().value;
    if (oldest) {
      displayCache.delete(oldest);
    }
  }
};

export const forgetMediaDisplay = (filePath: string) => {
  displayCache.delete(filePath);
};

const encodeDisplayImage = (filePath: string, image: NativeImage) => {
  if (extname(filePath).toLowerCase() === '.png') {
    return { body: image.toPNG(), mime: 'image/png' };
  }
  return { body: image.toJPEG(92), mime: 'image/jpeg' };
};

const loadDisplayImage = async (filePath: string, orientation: number) => {
  if (isRawImageFile(filePath)) {
    const jpeg = await extractRawPreviewJpeg(filePath);
    if (!jpeg) {
      return null;
    }
    const image = nativeImage.createFromBuffer(jpeg);
    if (image.isEmpty()) {
      return null;
    }
    return applyExifOrientation(image, orientation);
  }

  const image = nativeImage.createFromPath(filePath);
  if (image.isEmpty()) {
    return null;
  }
  if (orientation <= 1) {
    return image;
  }

  const swaps = orientation >= 5;
  if (swaps) {
    const { width, height } = image.getSize();
    const original = await readImageDimensions(filePath);
    if (width === original.height && height === original.width) {
      return image;
    }
  }

  return applyExifOrientation(image, orientation);
};

export const readDisplayBytes = async (filePath: string): Promise<CachedDisplay | null> => {
  const mtimeMs = (await stat(filePath)).mtimeMs;
  const cached = displayCache.get(filePath);
  if (cached && cached.mtimeMs === mtimeMs) {
    return cached;
  }

  const orientation = await readImageOrientation(filePath);
  if (orientation === 1 && !isRawImageFile(filePath)) {
    const body = await readFile(filePath);
    const next = { mtimeMs, body, mime: mimeForPath(filePath) };
    rememberDisplay(filePath, next);
    return next;
  }

  const image = await loadDisplayImage(filePath, orientation);
  if (!image) {
    return null;
  }
  const encoded = encodeDisplayImage(filePath, image);
  const next = { mtimeMs, ...encoded };
  rememberDisplay(filePath, next);
  return next;
};

export const registerMediaScheme = () => {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: MEDIA_FILE_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true,
        bypassCSP: true
      }
    }
  ]);
};

export const handleMediaProtocol = () => {
  protocol.handle(MEDIA_FILE_SCHEME, async (request) => {
    const url = new URL(request.url);
    const filePath = url.searchParams.get('path');
    if (!filePath || !isImageFile(filePath)) {
      return new Response('Not found', { status: 404 });
    }

    try {
      const display = await readDisplayBytes(filePath);
      if (!display) {
        return new Response('Not found', { status: 404 });
      }
      // Every caller of toMediaFileUrl passes a `v` revision that changes
      // whenever the file's content does (see media-file-url.ts), so a given
      // URL's bytes never change — safe for the renderer to cache forever.
      // Fall back to no-cache for the (unused) bare path, just in case.
      const cacheControl = url.searchParams.has('v') ? 'max-age=31536000, immutable' : 'no-cache';
      return new Response(Uint8Array.from(display.body), {
        headers: {
          'content-type': display.mime,
          'content-length': String(display.body.length),
          'cache-control': cacheControl
        }
      });
    } catch {
      return new Response('Not found', { status: 404 });
    }
  });
};
