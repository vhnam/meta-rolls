import { open } from 'node:fs/promises';

import { imageSize } from 'image-size';

import { readExifImageDimensions } from './exif-reader';

const HEADER_BYTES = 512 * 1024;

const emptyDimensions = { width: 0, height: 0 };

const hasDimensions = (size: { width: number; height: number }) =>
  size.width > 0 && size.height > 0;

const readHeaderDimensions = async (
  filePath: string
): Promise<{ width: number; height: number }> => {
  const handle = await open(filePath, 'r');
  try {
    const fileStat = await handle.stat();
    const inputSize = Math.min(fileStat.size, HEADER_BYTES);
    if (inputSize <= 0) {
      return emptyDimensions;
    }

    const input = new Uint8Array(inputSize);
    await handle.read(input, 0, inputSize, 0);
    const size = imageSize(input);
    const largest =
      size.images && size.images.length > 0
        ? size.images.reduce((currentLargest, image) =>
            image.width * image.height > currentLargest.width * currentLargest.height
              ? image
              : currentLargest
          )
        : size;

    return {
      width: largest.width ?? 0,
      height: largest.height ?? 0
    };
  } finally {
    await handle.close();
  }
};

export const readImageDimensions = async (
  filePath: string
): Promise<{ width: number; height: number }> => {
  try {
    const headerSize = await readHeaderDimensions(filePath);
    if (hasDimensions(headerSize)) {
      return headerSize;
    }
  } catch {
    // RAW and other camera formats often have no parseable image header.
  }

  return readExifImageDimensions(filePath);
};
