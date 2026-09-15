import { PHOTO_OVERVIEW_FIELDS } from '#/constants/media';
import { type PhotoExifField, type PhotoItem } from '#/types';

import { formatFileSize } from './format-file-size';

export type PhotoOverviewItem = {
  id: string;
  label: string;
  value: string;
};

export type PhotoOverviewCell =
  | { kind: 'aperture'; value: string; colSpan?: 1 | 2 }
  | { kind: 'text'; value: string; colSpan?: 1 | 2 }
  | { kind: 'iso'; value: string; colSpan?: 1 | 2 };

export type PhotoOverviewCards = {
  exposure: PhotoOverviewCell[][];
  file: PhotoOverviewCell[][];
};

const PLACEHOLDER = '--';

const fieldName = (label: string) => {
  const separator = label.lastIndexOf(':');
  return separator >= 0 ? label.slice(separator + 1) : label;
};

const formatShutterSpeed = (value: string, compact = false) => {
  if (!value) {
    return '';
  }
  const suffix = compact ? '' : ' s';
  if (/s$/i.test(value)) {
    return compact ? value.replace(/\s*s$/i, '').trim() : value;
  }
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0 && numeric < 1) {
    return `1/${Math.round(1 / numeric)}${suffix}`;
  }
  return compact ? value : `${value}${suffix}`;
};

const formatAperture = (value: string) => value.replace(/^f\/?/i, '').trim();

const formatResolution = (value: string) => value.replace(/x/i, ' x ');

const buildOverviewValues = (fields: PhotoExifField[] | undefined) => {
  const byName = new Map<string, string>();
  for (const field of fields ?? []) {
    const name = fieldName(field.label);
    if (!byName.has(name)) {
      byName.set(name, field.value);
    }
  }

  const width = byName.get('ImageWidth') ?? byName.get('ExifImageWidth');
  const height = byName.get('ImageHeight') ?? byName.get('ExifImageHeight');

  const values = new Map<string, string>();
  for (const spec of PHOTO_OVERVIEW_FIELDS) {
    let value = spec.keys.map((key) => byName.get(key)).find(Boolean) ?? '';
    if (spec.id === 'resolution') {
      value = value ? formatResolution(value) : width && height ? `${width} x ${height}` : '';
    } else if (spec.id === 'shutter') {
      value = formatShutterSpeed(value, true);
    } else if (spec.id === 'aperture') {
      value = formatAperture(value);
    }
    values.set(spec.id, value);
  }

  return values;
};

const textCell = (value: string, colSpan?: 1 | 2): PhotoOverviewCell =>
  value
    ? { kind: 'text', value, ...(colSpan === 2 ? { colSpan: 2 } : {}) }
    : { kind: 'text', value: PLACEHOLDER, ...(colSpan === 2 ? { colSpan: 2 } : {}) };

export const getPhotoOverview = (fields: PhotoExifField[] | undefined): PhotoOverviewItem[] => {
  const values = buildOverviewValues(fields);

  return PHOTO_OVERVIEW_FIELDS.map((spec) => ({
    id: spec.id,
    label: spec.label,
    value: values.get(spec.id) ?? ''
  }));
};

export const getPhotoOverviewCards = (
  photo: PhotoItem,
  fields: PhotoExifField[] | undefined
): PhotoOverviewCards => {
  const values = buildOverviewValues(fields);
  const aperture = values.get('aperture') ?? '';
  const shutter = values.get('shutter') ?? '';
  const iso = values.get('iso') ?? '';
  const whiteBalance = values.get('whiteBalance') ?? '';
  const resolution =
    values.get('resolution') ??
    (photo.width && photo.height ? `${photo.width} x ${photo.height}` : '');
  const fileSize = formatFileSize(photo.size);
  const colorSpace = values.get('colorSpace') ?? '';

  return {
    exposure: [
      [
        aperture ? { kind: 'aperture', value: aperture } : { kind: 'text', value: PLACEHOLDER },
        textCell(shutter)
      ],
      [
        textCell(whiteBalance),
        iso ? { kind: 'iso', value: iso } : { kind: 'text', value: PLACEHOLDER }
      ]
    ],
    file: [[textCell(fileSize), textCell(colorSpace)], [textCell(resolution, 2)]]
  };
};
