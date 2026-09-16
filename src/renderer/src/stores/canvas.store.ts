import { create } from 'zustand';

import { DEFAULT_SLOT_SETTINGS, SLOTS_PER_SPREAD } from '#/constants/canvas';
import {
  type InstaxPrintFormat,
  type PaperPrintFormat,
  type SlotFit,
  type SlotSettings
} from '#/types';

type CanvasState = {
  selectedSlotId: string | null;
  slotSettings: Record<string, SlotSettings>;
  photosKey: string;
  spreadPhotoIds: (string | null)[][];
  activeSpreadIndex: number;
  // Each album picks its own page preset and page size independently — e.g.
  // Instax Mini prints laid out on an A4 sheet — and neither falls back to a
  // single app-wide default once an album has an explicit choice.
  pagePresetByAlbumId: Record<string, InstaxPrintFormat>;
  pageSizeByAlbumId: Record<string, PaperPrintFormat | null>;
};

type CanvasActions = {
  selectSlot: (slotId: string | null) => void;
  setSlotFit: (slotId: string, fit: SlotFit) => void;
  setSlotCrop: (slotId: string, crop: Pick<SlotSettings, 'cropX' | 'cropY' | 'cropZoom'>) => void;
  resetSlot: (slotId: string) => void;
  setActiveSpreadIndex: (index: number) => void;
  addSpread: () => void;
  swapSpreadSlots: (spreadIndex: number, slotIndexA: number, slotIndexB: number) => void;
  syncSpreadsWithPhotos: (photosKey: string, photoIds: string[]) => void;
  setAlbumPagePreset: (albumId: string, preset: InstaxPrintFormat) => void;
  setAlbumPageSize: (albumId: string, pageSize: PaperPrintFormat | null) => void;
};

export type CanvasStore = CanvasState & CanvasActions;

const upsertSlot = (
  slotSettings: Record<string, SlotSettings>,
  slotId: string,
  patch: Partial<SlotSettings>
) => ({
  ...slotSettings,
  [slotId]: {
    ...(slotSettings[slotId] ?? DEFAULT_SLOT_SETTINGS),
    ...patch
  }
});

const buildSpread = (photoIds: string[], spreadIndex: number): (string | null)[] =>
  Array.from(
    { length: SLOTS_PER_SPREAD },
    (_, localIndex) => photoIds[spreadIndex * SLOTS_PER_SPREAD + localIndex] ?? null
  );

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  selectedSlotId: null,
  slotSettings: {},
  photosKey: '',
  spreadPhotoIds: [],
  activeSpreadIndex: 0,
  pagePresetByAlbumId: {},
  pageSizeByAlbumId: {},
  selectSlot: (selectedSlotId) => set({ selectedSlotId }),
  setSlotFit: (slotId, fit) =>
    set((state) => ({
      slotSettings: upsertSlot(state.slotSettings, slotId, { fit })
    })),
  setSlotCrop: (slotId, crop) =>
    set((state) => ({
      slotSettings: upsertSlot(state.slotSettings, slotId, crop)
    })),
  resetSlot: (slotId) =>
    set((state) => {
      const rest = { ...state.slotSettings };
      delete rest[slotId];
      return { slotSettings: rest };
    }),
  // Slot ids repeat across spreads (only one spread is mounted at a time), so
  // a lingering selection from another spread must be cleared on navigation.
  setActiveSpreadIndex: (activeSpreadIndex) => set({ activeSpreadIndex, selectedSlotId: null }),
  addSpread: () =>
    set((state) => ({
      spreadPhotoIds: [...state.spreadPhotoIds, buildSpread([], 0)],
      activeSpreadIndex: state.spreadPhotoIds.length,
      selectedSlotId: null
    })),
  swapSpreadSlots: (spreadIndex, slotIndexA, slotIndexB) =>
    set((state) => ({
      spreadPhotoIds: state.spreadPhotoIds.map((slots, index) => {
        if (index !== spreadIndex) {
          return slots;
        }
        const next = [...slots];
        [next[slotIndexA], next[slotIndexB]] = [next[slotIndexB], next[slotIndexA]];
        return next;
      })
    })),
  syncSpreadsWithPhotos: (photosKey, photoIds) => {
    if (get().photosKey === photosKey) {
      return;
    }
    const spreadCount = Math.max(1, Math.ceil(photoIds.length / SLOTS_PER_SPREAD));
    set({
      photosKey,
      activeSpreadIndex: 0,
      selectedSlotId: null,
      spreadPhotoIds: Array.from({ length: spreadCount }, (_, spreadIndex) =>
        buildSpread(photoIds, spreadIndex)
      )
    });
  },
  setAlbumPagePreset: (albumId, preset) =>
    set((state) => ({
      pagePresetByAlbumId: { ...state.pagePresetByAlbumId, [albumId]: preset }
    })),
  setAlbumPageSize: (albumId, pageSize) =>
    set((state) => ({
      pageSizeByAlbumId: { ...state.pageSizeByAlbumId, [albumId]: pageSize }
    }))
}));
