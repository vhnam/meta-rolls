import { METADATA_NAME_LABEL, UNGROUPED_METADATA_GROUP } from '#/constants/media';
import { type PhotoExifField, type PhotoItem } from '#/types';

import { formatMetadataValue } from './format-metadata-value';

export type MetadataGroup = {
  name: string;
  rows: PhotoExifField[];
};

const parseField = (label: string): { group: string; field: string } => {
  const separator = label.indexOf(':');
  if (separator <= 0) {
    return { group: UNGROUPED_METADATA_GROUP, field: label };
  }

  return {
    group: label.slice(0, separator),
    field: label.slice(separator + 1)
  };
};

export const buildMetadataRows = (
  photo: PhotoItem,
  fields: PhotoExifField[] | undefined
): PhotoExifField[] => [{ label: METADATA_NAME_LABEL, value: photo.name }, ...(fields ?? [])];

export const groupMetadataRows = (rows: PhotoExifField[]): MetadataGroup[] => {
  const groups = new Map<string, PhotoExifField[]>();

  for (const row of rows) {
    const { group, field } = parseField(row.label);
    const groupedRows = groups.get(group) ?? [];
    groupedRows.push({ label: field, value: formatMetadataValue(row.value) });
    groups.set(group, groupedRows);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, groupedRows]) => ({
      name,
      rows: groupedRows.sort((a, b) => a.label.localeCompare(b.label))
    }));
};
