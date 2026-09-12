import { pathToFileURL } from 'node:url';

import { net, protocol } from 'electron';

import { MEDIA_FILE_SCHEME } from '../../../shared/media';
import { extractRawPreviewJpeg } from '../services/exif-reader';
import { isRawImageFile } from '../services/media-library';

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
    const filePath = new URL(request.url).searchParams.get('path');
    if (!filePath) {
      return new Response('Not found', { status: 404 });
    }

    try {
      if (isRawImageFile(filePath)) {
        const jpeg = await extractRawPreviewJpeg(filePath);
        if (!jpeg) {
          return new Response('Not found', { status: 404 });
        }
        return new Response(new Blob([Uint8Array.from(jpeg)], { type: 'image/jpeg' }), {
          headers: {
            'content-type': 'image/jpeg',
            'content-length': String(jpeg.length)
          }
        });
      }

      return await net.fetch(pathToFileURL(filePath).href);
    } catch {
      return new Response('Not found', { status: 404 });
    }
  });
};
