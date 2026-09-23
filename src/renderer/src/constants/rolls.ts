import { type FilmFormat, type FilmProcess, type FilmType, type RollStatus } from '#/shared/rolls';

export const ROLL_STATUS_LABEL: Record<RollStatus, string> = {
  unused: 'Unused',
  loaded: 'Loaded',
  shot: 'Shot',
  developing: 'Developing',
  developed: 'Developed'
};

/** Label for the button that moves a roll to the given status. */
export const ROLL_STATUS_ACTION: Record<RollStatus, string> = {
  unused: 'Mark as unused',
  loaded: 'Mark as loaded',
  shot: 'Mark as finished',
  developing: 'Send to lab',
  developed: 'Mark as developed'
};

export const FILM_FORMAT_LABEL: Record<FilmFormat, string> = {
  '135': '135',
  '120': '120',
  '4x5': '4×5',
  other: 'Other'
};

export const FILM_PROCESS_LABEL: Record<FilmProcess, string> = {
  c41: 'C-41',
  e6: 'E-6',
  bw: 'B&W'
};

export const FILM_TYPE_LABEL: Record<FilmType, string> = {
  'color-negative': 'Color negative',
  slide: 'Slide',
  bw: 'B&W'
};

export const ROLL_SORT = {
  updated: 'updated',
  loaded: 'loaded',
  name: 'name'
} as const;

export type RollSort = (typeof ROLL_SORT)[keyof typeof ROLL_SORT];

export const ROLL_SORT_LABEL: Record<RollSort, string> = {
  updated: 'Last updated',
  loaded: 'Loaded date',
  name: 'Name'
};

export const ALL_FILTER = 'all';
