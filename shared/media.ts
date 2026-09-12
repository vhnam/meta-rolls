export const MEDIA_FILE_SCHEME = 'meta-rolls-media';

export type PhotoExifField = {
  label: string;
  value: string;
};

export type PhotoExif = {
  fields: PhotoExifField[];
};

