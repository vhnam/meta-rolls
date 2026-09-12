import { PHOTO_OVERVIEW_FIELDS } from '#/constants/media';
import { type PhotoExifField } from '#/types';

export type PhotoOverviewItem = {
  id: string;
  label: string;
  value: string;
};

const fieldName = (label: string) => {
  const separator = label.lastIndexOf(':');
  return separator >= 0 ? label.slice(separator + 1) : label;
};

const formatShutterSpeed = (value: string) => {
  if (!value) {
    return '';
  }
  if (/s$/i.test(value)) {
    return value;
  }
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0 && numeric < 1) {
    return `1/${Math.round(1 / numeric)} s`;
  }
  return `${value} s`;
};

const formatAperture = (value: string) => value.replace(/^f\/?/i, '').trim();

const formatResolution = (value: string) => value.replace(/x/i, ' x ');

export const getPhotoOverview = (fields: PhotoExifField[] | undefined): PhotoOverviewItem[] => {
  const byName = new Map<string, string>();
  for (const field of fields ?? []) {
    const name = fieldName(field.label);
    if (!byName.has(name)) {
      byName.set(name, field.value);
    }
  }

  const width = byName.get('ImageWidth') ?? byName.get('ExifImageWidth');
  const height = byName.get('ImageHeight') ?? byName.get('ExifImageHeight');

  return PHOTO_OVERVIEW_FIELDS.map((spec) => {
    let value = spec.keys.map((key) => byName.get(key)).find(Boolean) ?? '';
    if (spec.id === 'resolution') {
      value = value ? formatResolution(value) : width && height ? `${width} x ${height}` : '';
    } else if (spec.id === 'shutter') {
      value = formatShutterSpeed(value);
    } else if (spec.id === 'aperture') {
      value = formatAperture(value);
    }
    return { id: spec.id, label: spec.label, value };
  });
};
