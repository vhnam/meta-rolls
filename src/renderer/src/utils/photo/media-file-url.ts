import { MEDIA_FILE_SCHEME } from '#/shared/media';

export const toMediaFileUrl = (filePath: string, revision?: number) => {
  const params = new URLSearchParams({ path: filePath });
  if (revision) {
    params.set('v', String(revision));
  }
  return `${MEDIA_FILE_SCHEME}://local/?${params.toString()}`;
};
