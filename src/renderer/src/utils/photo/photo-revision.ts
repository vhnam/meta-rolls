import { type PhotoItem } from '#/types';

// The in-app rotation counter (bumped right after a rotate IPC call, see
// media-pool.store.ts's photoRevisions) takes priority when present — it's
// the freshest known value. Otherwise fall back to the file's mtime from
// the last folder scan, so a photo edited by another app (or before this
// session ever opened it) still gets a fresh meta-rolls-media:// URL
// instead of one keyed by a revision that's been stuck at 0 since install.
export const resolvePhotoRevision = (
  photoRevisions: Record<string, number>,
  photo: Pick<PhotoItem, 'id' | 'mtimeMs'>
): number => photoRevisions[photo.id] ?? photo.mtimeMs ?? 0;
