import { type NativeImage, nativeImage } from 'electron';

const copyPixel = (source: Buffer, dest: Buffer, sourceIndex: number, destIndex: number) => {
  dest[destIndex] = source[sourceIndex];
  dest[destIndex + 1] = source[sourceIndex + 1];
  dest[destIndex + 2] = source[sourceIndex + 2];
  dest[destIndex + 3] = source[sourceIndex + 3];
};

const mapBitmap = (
  source: Buffer,
  width: number,
  height: number,
  destWidth: number,
  destHeight: number,
  map: (x: number, y: number) => { x: number; y: number }
) => {
  const dest = Buffer.allocUnsafe(source.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const next = map(x, y);
      copyPixel(source, dest, (y * width + x) * 4, (next.y * destWidth + next.x) * 4);
    }
  }
  return nativeImage.createFromBitmap(dest, { width: destWidth, height: destHeight });
};

export const applyExifOrientation = (image: NativeImage, orientation: number): NativeImage => {
  if (orientation <= 1 || image.isEmpty()) {
    return image;
  }

  const { width, height } = image.getSize();
  const source = image.toBitmap();

  switch (orientation) {
    case 2:
      return mapBitmap(source, width, height, width, height, (x, y) => ({
        x: width - 1 - x,
        y
      }));
    case 3:
      return mapBitmap(source, width, height, width, height, (x, y) => ({
        x: width - 1 - x,
        y: height - 1 - y
      }));
    case 4:
      return mapBitmap(source, width, height, width, height, (x, y) => ({
        x,
        y: height - 1 - y
      }));
    case 5:
      return mapBitmap(source, width, height, height, width, (x, y) => ({ x: y, y: x }));
    case 6:
      return mapBitmap(source, width, height, height, width, (x, y) => ({
        x: height - 1 - y,
        y: x
      }));
    case 7:
      return mapBitmap(source, width, height, height, width, (x, y) => ({
        x: height - 1 - y,
        y: width - 1 - x
      }));
    case 8:
      return mapBitmap(source, width, height, height, width, (x, y) => ({
        x: y,
        y: width - 1 - x
      }));
    default:
      return image;
  }
};
