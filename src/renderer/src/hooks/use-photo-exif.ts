import { useEffect, useState } from 'react';

import { getApi } from '#/hooks/use-ipc';
import { type PhotoExif } from '#/types';

const inflight = new Map<string, Promise<PhotoExif | null>>();
const resolved = new Map<string, PhotoExif | null>();

const readExif = (filePath: string) => {
  const pending = inflight.get(filePath);
  if (pending) {
    return pending;
  }

  const request = getApi()
    .media.readExif(filePath)
    .then((exif) => {
      resolved.set(filePath, exif);
      inflight.delete(filePath);
      return exif;
    })
    .catch(() => {
      resolved.set(filePath, null);
      inflight.delete(filePath);
      return null;
    });

  inflight.set(filePath, request);
  return request;
};

export const usePhotoExif = (filePath: string | null) => {
  const [, setVersion] = useState(0);

  useEffect(() => {
    if (!filePath || resolved.has(filePath)) {
      return;
    }

    let cancelled = false;
    void readExif(filePath).then(() => {
      if (!cancelled) {
        setVersion((version) => version + 1);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [filePath]);

  if (!filePath) {
    return { exif: null, loading: false };
  }

  if (resolved.has(filePath)) {
    return { exif: resolved.get(filePath) ?? null, loading: false };
  }

  return { exif: null, loading: true };
};
