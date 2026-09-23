import { MEDIA_FILE_SCHEME } from '#/shared/media';

export const toMediaFileUrl = (filePath: string, revision?: number, width?: number) => {
  const params = new URLSearchParams({ path: filePath });
  if (revision !== undefined) {
    params.set('v', String(revision));
  }
  if (width !== undefined) {
    params.set('w', String(width));
  }
  return `${MEDIA_FILE_SCHEME}://local/?${params.toString()}`;
};
