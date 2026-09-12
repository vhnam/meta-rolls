import { useEffect, useMemo, useState } from 'react';

import { getApi } from '#/hooks/use-ipc';
import { type PhotoExif, type PhotoItem } from '#/types';

import { formatMetadataValue } from './format-metadata-value';

type MediaMetadataProps = {
  photo: PhotoItem | null;
};

type MetadataRow = {
  label: string;
  value: string;
};

type MetadataGroup = {
  name: string;
  rows: MetadataRow[];
};

const UNGROUPED = 'General';

const parseField = (label: string): { group: string; field: string } => {
  const separator = label.indexOf(':');
  if (separator <= 0) {
    return { group: UNGROUPED, field: label };
  }

  return {
    group: label.slice(0, separator),
    field: label.slice(separator + 1)
  };
};

const groupMetadataRows = (rows: MetadataRow[]): MetadataGroup[] => {
  const groups = new Map<string, MetadataRow[]>();

  for (const row of rows) {
    const { group, field } = parseField(row.label);
    const fields = groups.get(group) ?? [];
    fields.push({ label: field, value: formatMetadataValue(row.value) });
    groups.set(group, fields);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, groupedRows]) => ({
      name,
      rows: groupedRows.sort((a, b) => a.label.localeCompare(b.label))
    }));
};

const MediaMetadata = ({ photo }: MediaMetadataProps) => {
  const filePath = photo?.path ?? null;
  const [result, setResult] = useState<{ path: string; exif: PhotoExif | null } | null>(null);

  const exif = result?.path === filePath ? result.exif : null;
  const loading = filePath != null && result?.path !== filePath;

  useEffect(() => {
    if (!filePath) {
      return;
    }

    let cancelled = false;
    void getApi()
      .media.readExif(filePath)
      .then((nextExif) => {
        if (!cancelled) {
          setResult({ path: filePath, exif: nextExif });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ path: filePath, exif: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filePath]);

  const groups = useMemo(
    () =>
      groupMetadataRows([
        ...(photo ? [{ label: 'File:Name', value: photo.name }] : []),
        ...(exif?.fields ?? [])
      ]),
    [exif?.fields, photo]
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-col overflow-hidden border border-border bg-sidebar">
      <div className="flex h-7 items-center justify-between border-b border-sidebar-border bg-muted px-2">
        <span className="text-[11px] font-medium text-sidebar-foreground">Metadata</span>
      </div>
      {!photo ? (
        <div className="flex flex-1 items-center justify-center px-3">
          <p className="text-xs text-muted-foreground">Select a photo to view metadata</p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 scroll-fade overflow-auto px-3 py-2">
          {groups.map((group) => (
            <section key={group.name} className="mb-2 last:mb-0">
              <h3 className="sticky top-0 z-10 bg-sidebar py-1 text-tiny font-medium text-sidebar-foreground">
                {group.name}
              </h3>
              <dl>
                {group.rows.map((row) => (
                  <div
                    key={`${group.name}:${row.label}`}
                    className="grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)] gap-x-2 gap-y-0.5 py-0.5"
                  >
                    <dt className="break-all text-tiny text-muted-foreground">{row.label}</dt>
                    <dd className="break-all text-tiny text-sidebar-foreground">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
          {loading ? <p className="pt-1 text-tiny text-muted-foreground">Reading EXIF…</p> : null}
        </div>
      )}
    </div>
  );
};

export default MediaMetadata;
