import { type SlotSettings } from '#/types/canvas';

export const SLOT_FIT = {
  cover: 'cover',
  contain: 'contain'
} as const;

export const DEFAULT_SLOT_SETTINGS: SlotSettings = {
  fit: SLOT_FIT.cover,
  cropX: 0.5,
  cropY: 0.5,
  cropZoom: 1
};
