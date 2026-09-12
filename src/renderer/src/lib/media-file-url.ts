import { MEDIA_FILE_SCHEME } from '../../../../shared/media';

export const toMediaFileUrl = (filePath: string) =>
  `${MEDIA_FILE_SCHEME}://local/?path=${encodeURIComponent(filePath)}`;
