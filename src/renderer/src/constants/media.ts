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

export const FILE_LIST_RATING_COLUMN = {
  id: 'rating',
  label: 'Rating',
  defaultWidth: 96,
  minWidth: 80
} as const;

export const ALBUM_FILE_LIST_COLUMNS = [
  FILE_LIST_COLUMNS[0],
  FILE_LIST_RATING_COLUMN,
  FILE_LIST_COLUMNS[1],
  FILE_LIST_COLUMNS[2],
  FILE_LIST_COLUMNS[3]
] as const;

export type FileListColumn = (typeof FILE_LIST_COLUMNS)[number] | typeof FILE_LIST_RATING_COLUMN;
export type FileListColumnId = FileListColumn['id'];

export const FILE_LIST_GRID_CLASS =
  'grid w-full min-w-[var(--file-list-min-width)] [grid-template-columns:var(--file-list-cols)]';
export const FILE_LIST_ROW_CLASS = `${FILE_LIST_GRID_CLASS} h-6 w-full`;
export const FILE_LIST_CELL_CLASS = 'flex min-w-0 items-center self-stretch px-1.5';
export const FILE_LIST_ROW_HEIGHT = 24;
export const FILE_LIST_ROW_X_PADDING = 0;

export const FOLDER_SPINNER_DELAY_MS = 150;
export const FOLDER_TREE_PADDING_START = 8;
export const FOLDER_TREE_DEPTH_STEP = 12;
export const FOLDER_TREE_ROW_HEIGHT = 24;

export const THUMBNAIL_MIN_COLUMNS = 3;
export const THUMBNAIL_MAX_COLUMNS = 6;
export const THUMBNAIL_STRIP_MIN_WIDTH = 120;
export const THUMBNAIL_STRIP_MAX_WIDTH = 280;
export const THUMBNAIL_ASPECT_RATIO = '16 / 9';
export const THUMBNAIL_ZOOM_STEP = 0;
export const THUMBNAIL_PANE_CLASS =
  '@container/thumbnail flex min-h-0 min-w-0 flex-[1.2] flex-col overflow-hidden border-l border-border bg-card';
export const THUMBNAIL_GRID_CLASS =
  'grid w-full gap-3 [--thumb-fit-cols:1] @min-[12rem]/thumbnail:[--thumb-fit-cols:2] @min-[18rem]/thumbnail:[--thumb-fit-cols:3] @min-[24rem]/thumbnail:[--thumb-fit-cols:4] @min-[32rem]/thumbnail:[--thumb-fit-cols:5] @min-[40rem]/thumbnail:[--thumb-fit-cols:6]';
export const THUMBNAIL_STRIP_CLASS = 'inline-flex h-full items-start gap-3';

export const METADATA_PANE_CLASS =
  '@container/metadata flex h-full min-h-0 min-w-0 flex-col overflow-hidden border border-border bg-sidebar';
export const METADATA_OVERVIEW_LAYOUT_CLASS =
  'flex min-w-0 flex-col gap-2 @min-[18rem]/metadata:flex-row';
export const METADATA_OVERVIEW_CARD_CLASS =
  'min-w-0 flex-1 overflow-hidden rounded-sm border border-border bg-muted/40';
export const METADATA_OVERVIEW_CELL_CLASS =
  'flex min-h-9 min-w-0 items-center justify-center overflow-hidden px-1.5 text-center text-tiny text-sidebar-foreground';
export const METADATA_ROW_CLASS =
  'grid grid-cols-1 gap-x-3 gap-y-0.5 py-0.5 @min-[14rem]/metadata:grid-cols-[minmax(0,42%)_minmax(0,1fr)] @min-[14rem]/metadata:items-start';
export const METADATA_LABEL_CLASS =
  'min-w-0 text-tiny text-muted-foreground @min-[14rem]/metadata:truncate';
export const METADATA_VALUE_CLASS =
  'min-w-0 text-tiny text-sidebar-foreground break-words @min-[14rem]/metadata:text-right';
export const METADATA_OVERVIEW_GRID_CLASS =
  'grid grid-cols-1 gap-x-4 gap-y-2 @min-[12rem]/metadata:grid-cols-2 @min-[20rem]/metadata:grid-cols-3 @min-[28rem]/metadata:grid-cols-4';

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
