export const MEDIA_FILE_SCHEME = 'meta-rolls-media';

export type PhotoRotateDirection = 'cw' | 'ccw';

export const isPhotoRotateDirection = (value: unknown): value is PhotoRotateDirection =>
  value === 'cw' || value === 'ccw';

export type PhotoExifField = {
  label: string;
  value: string;
};

export type PhotoExif = {
  fields: PhotoExifField[];
};
