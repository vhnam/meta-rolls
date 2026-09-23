import { extname } from 'node:path';

import { nativeImage, type NativeImage } from 'electron';

import { extractRawPreviewJpeg } from '../services/exif-reader';
import { readImageDimensions } from '../services/image-dimensions';
import { isRawImageFile } from '../services/media-library';
import { applyExifOrientation } from './apply-exif-orientation';

export const mimeForPath = (filePath: string) => {
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

export const encodeDisplayImage = (filePath: string, image: NativeImage) => {
  if (extname(filePath).toLowerCase() === '.png') {
    return { body: image.toPNG(), mime: 'image/png' };
  }
  return { body: image.toJPEG(92), mime: 'image/jpeg' };
};

// Decodes the image at its native resolution, without applying EXIF rotation.
export const decodeSourceImage = async (filePath: string): Promise<NativeImage | null> => {
  if (isRawImageFile(filePath)) {
    const jpeg = await extractRawPreviewJpeg(filePath);
    if (!jpeg) {
      return null;
    }
    const image = nativeImage.createFromBuffer(jpeg);
    return image.isEmpty() ? null : image;
  }

  const image = nativeImage.createFromPath(filePath);
  return image.isEmpty() ? null : image;
};

// Some cameras bake the rotation into the pixel data instead of only setting
// the EXIF tag — when the decoded (swapped) dimensions already match that,
// re-applying the tag's rotation would turn the image sideways again. Only
// the 90/270-degree orientations (5-8) can swap width/height like this.
//
// RAW files never take this path: `image` here is the extracted embedded
// preview JPEG, not the sensor data, and readImageDimensions(filePath) reads
// the RAW container's own dimensions — the two aren't the same frame of
// reference, so comparing them can't tell us whether rotation is baked in.
// Always rotate RAW previews unconditionally, matching pre-refactor
// behavior.
export const isOrientationAlreadyBaked = async (
  filePath: string,
  image: NativeImage,
  orientation: number
): Promise<boolean> => {
  if (orientation < 5 || isRawImageFile(filePath)) {
    return false;
  }
  const { width, height } = image.getSize();
  const original = await readImageDimensions(filePath);
  return width === original.height && height === original.width;
};

export const orientImage = async (
  filePath: string,
  image: NativeImage,
  orientation: number
): Promise<NativeImage> => {
  if (orientation <= 1) {
    return image;
  }
  if (await isOrientationAlreadyBaked(filePath, image, orientation)) {
    return image;
  }
  return applyExifOrientation(image, orientation);
};

export const loadDisplayImage = async (
  filePath: string,
  orientation: number
): Promise<NativeImage | null> => {
  const image = await decodeSourceImage(filePath);
  if (!image) {
    return null;
  }
  return orientImage(filePath, image, orientation);
};
