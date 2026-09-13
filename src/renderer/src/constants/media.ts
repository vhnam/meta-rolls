export const FOLDER_KIND = {
  disk: 'disk',
  folder: 'folder'
} as const;

export const MEDIA_VIEW = {
  list: 'list',
  thumbnail: 'thumbnail'
} as const;

export const PHOTO_PANE = {
  browser: 'browser',
  albums: 'albums'
} as const;

export const FILE_LIST_COLUMNS = [
  { id: 'name', label: 'File Name', defaultWidth: 220, minWidth: 120 },
  { id: 'createdAt', label: 'Date Created', defaultWidth: 120, minWidth: 88 },
  { id: 'size', label: 'Size', defaultWidth: 76, minWidth: 56 },
  { id: 'resolution', label: 'Resolution', defaultWidth: 108, minWidth: 80 }
] as const;

export type FileListColumnId = (typeof FILE_LIST_COLUMNS)[number]['id'];

export const FILE_LIST_GRID_CLASS =
  'grid w-full min-w-[var(--file-list-min-width)] [grid-template-columns:var(--file-list-cols)]';
export const FILE_LIST_ROW_CLASS = `${FILE_LIST_GRID_CLASS} h-5 w-full`;
export const FILE_LIST_CELL_CLASS = 'flex min-w-0 items-center self-stretch px-1.5';
export const FILE_LIST_ROW_HEIGHT = 20;
export const FILE_LIST_ROW_X_PADDING = 0;

export const FOLDER_SPINNER_DELAY_MS = 150;
export const FOLDER_TREE_PADDING_START = 8;
export const FOLDER_TREE_DEPTH_STEP = 12;
export const FOLDER_TREE_ROW_HEIGHT = 24;

export const THUMBNAIL_MIN_COLUMNS = 3;
export const THUMBNAIL_MAX_COLUMNS = 6;
export const THUMBNAIL_ASPECT_RATIO = '16 / 9';
export const THUMBNAIL_ZOOM_STEP = 25;
export const THUMBNAIL_PANE_CLASS =
  '@container/thumbnail flex min-h-0 min-w-0 flex-[1.2] flex-col overflow-hidden bg-background';
export const THUMBNAIL_GRID_CLASS =
  'grid w-full gap-3 [--thumb-fit-cols:1] @min-[12rem]/thumbnail:[--thumb-fit-cols:2] @min-[18rem]/thumbnail:[--thumb-fit-cols:3] @min-[24rem]/thumbnail:[--thumb-fit-cols:4] @min-[32rem]/thumbnail:[--thumb-fit-cols:5] @min-[40rem]/thumbnail:[--thumb-fit-cols:6]';

export const UNGROUPED_METADATA_GROUP = 'General';
export const METADATA_NAME_LABEL = 'File:Name';
export const METADATA_DATETIME_FORMAT = 'MMM DD, YYYY h:mm:ss A';
export const METADATA_DATE_FORMAT = 'MMM DD, YYYY';

export const PHOTO_OVERVIEW_FIELDS = [
  { id: 'iso', label: 'ISO', keys: ['ISO', 'ISOSpeed'] },
  {
    id: 'shutter',
    label: 'Shutter Speed',
    keys: ['ExposureTime', 'ShutterSpeed', 'ShutterSpeedValue']
  },
  { id: 'aperture', label: 'Aperture', keys: ['FNumber', 'Aperture', 'ApertureValue'] },
  { id: 'whiteBalance', label: 'White Balance', keys: ['WhiteBalance'] },
  { id: 'format', label: 'Image Format', keys: ['FileType', 'FileTypeExtension'] },
  { id: 'resolution', label: 'Resolution', keys: ['ImageSize'] },
  { id: 'colorSpace', label: 'Color Space', keys: ['ColorSpace', 'ColorSpaceData'] }
] as const;
