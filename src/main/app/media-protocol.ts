import { readFile, stat } from 'node:fs/promises';

import { protocol } from 'electron';

import { MEDIA_FILE_SCHEME } from '../../../shared/media';
import { readImageOrientation } from '../services/exif-reader';
import { isImageFile, isRawImageFile } from '../services/media-library';
import { encodeDisplayImage, loadDisplayImage, mimeForPath } from './image-decode';
import { readThumbnailBytes } from './thumbnail';

const DISPLAY_CACHE_LIMIT = 16;

type CachedDisplay = {
  mtimeMs: number;
  body: Buffer;
  mime: string;
};

const displayCache = new Map<string, CachedDisplay>();

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

export const readDisplayBytes = async (filePath: string): Promise<CachedDisplay | null> => {
  // Guard here, not just at the protocol handler's entry — pdf-export.ts
  // calls this directly with paths from a print request, bypassing that
  // gate.
  if (!isImageFile(filePath)) {
    return null;
  }
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
        stream: true
        // No bypassCSP: index.html's CSP already allowlists this scheme in
        // img-src, which is the only directive anything in the app needs it
        // for. Bypassing CSP entirely here would let it load scripts/styles
        // too, past script-src 'self'.
      }
    }
  ]);
};

const parseRequestedWidth = (url: URL): number | null => {
  const raw = url.searchParams.get('w');
  if (!raw) {
    return null;
  }
  const width = Number(raw);
  return Number.isFinite(width) && width > 0 ? width : null;
};

export const handleMediaProtocol = () => {
  protocol.handle(MEDIA_FILE_SCHEME, async (request) => {
    const url = new URL(request.url);
    const filePath = url.searchParams.get('path');
    if (!filePath || !isImageFile(filePath)) {
      return new Response('Not found', { status: 404 });
    }
    const requestedWidth = parseRequestedWidth(url);

    try {
      const display = requestedWidth
        ? await readThumbnailBytes(filePath, requestedWidth)
        : await readDisplayBytes(filePath);
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
