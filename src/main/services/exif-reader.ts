import { BinaryField, ExifDate, ExifDateTime, ExifTime, ExifTool } from 'exiftool-vendored';

import { type PhotoExif, type PhotoExifField } from '../../../shared/media';

const exiftool = new ExifTool({ maxProcs: 1 });

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

export const endExifTool = () => exiftool.end();
