import { create } from 'zustand';

import { DEFAULT_SLOT_SETTINGS, PHOTOS_PER_PAGE, SLOTS_PER_SPREAD } from '#/constants/canvas';
import { type PhotoRotateDirection, type SlotFit, type SlotSettings } from '#/types';
import { photoRotateDegrees } from '#/utils/preview/photo-rotate';

import { normalizeRotationDeg } from '#/shared/print';

type CanvasState = {
  selectedSlotId: string | null;
  slotSettings: Record<string, SlotSettings>;
  photosKey: string;
  spreadPhotoIds: (string | null)[][];
  activeSpreadIndex: number;
};

type CanvasActions = {
  selectSlot: (slotId: string | null) => void;
  setSlotFit: (slotId: string, fit: SlotFit) => void;
  setSlotCrop: (slotId: string, crop: Pick<SlotSettings, 'cropX' | 'cropY' | 'cropZoom'>) => void;
  rotateSlotImage: (slotId: string, direction: PhotoRotateDirection) => void;
  resetSlot: (slotId: string) => void;
  setActiveSpreadIndex: (index: number) => void;
  addSpread: () => void;
  swapSpreadSlots: (spreadIndex: number, slotIndexA: number, slotIndexB: number) => void;
  placePhotoInSpreadSlot: (spreadIndex: number, slotIndex: number, photoId: string) => void;
  clearSpreadSlot: (spreadIndex: number, slotIndex: number, slotId: string) => void;
  removePhotoFromCanvas: (photoId: string) => void;
  syncSpreadsWithPhotos: (photosKey: string, photoIds: string[], leadEmptySlots?: number) => void;
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

const buildSpread = (
  photoIds: string[],
  spreadIndex: number,
  leadEmptySlots = 0
): (string | null)[] =>
  Array.from({ length: SLOTS_PER_SPREAD }, (_, localIndex) => {
    const photoIndex = spreadIndex * SLOTS_PER_SPREAD + localIndex - leadEmptySlots;
    if (photoIndex < 0) {
      return null;
    }
    return photoIds[photoIndex] ?? null;
  });

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  selectedSlotId: null,
  slotSettings: {},
  photosKey: '',
  spreadPhotoIds: [],
  activeSpreadIndex: 0,
  selectSlot: (selectedSlotId) => set({ selectedSlotId }),
  setSlotFit: (slotId, fit) =>
    set((state) => ({
      slotSettings: upsertSlot(state.slotSettings, slotId, { fit })
    })),
  setSlotCrop: (slotId, crop) =>
    set((state) => ({
      slotSettings: upsertSlot(state.slotSettings, slotId, crop)
    })),
  rotateSlotImage: (slotId, direction) =>
    set((state) => {
      const current =
        state.slotSettings[slotId]?.imageRotationDeg ?? DEFAULT_SLOT_SETTINGS.imageRotationDeg;
      return {
        slotSettings: upsertSlot(state.slotSettings, slotId, {
          imageRotationDeg: normalizeRotationDeg(current + photoRotateDegrees(direction))
        })
      };
    }),
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
  placePhotoInSpreadSlot: (spreadIndex, slotIndex, photoId) =>
    set((state) => {
      const targetSlots = state.spreadPhotoIds[spreadIndex];
      if (!targetSlots || slotIndex < 0 || slotIndex >= targetSlots.length) {
        return state;
      }
      if (targetSlots[slotIndex] === photoId) {
        return state;
      }

      let fromSpread = -1;
      let fromSlot = -1;
      for (let index = 0; index < state.spreadPhotoIds.length; index += 1) {
        const found = state.spreadPhotoIds[index].indexOf(photoId);
        if (found !== -1) {
          fromSpread = index;
          fromSlot = found;
          break;
        }
      }

      const occupant = targetSlots[slotIndex] ?? null;
      return {
        spreadPhotoIds: state.spreadPhotoIds.map((slots, index) => {
          if (index !== spreadIndex && index !== fromSpread) {
            return slots;
          }
          const next = [...slots];
          if (index === spreadIndex) {
            next[slotIndex] = photoId;
          }
          if (index === fromSpread) {
            next[fromSlot] = occupant;
          }
          return next;
        })
      };
    }),
  clearSpreadSlot: (spreadIndex, slotIndex, slotId) =>
    set((state) => {
      const rest = { ...state.slotSettings };
      delete rest[slotId];
      return {
        slotSettings: rest,
        selectedSlotId: state.selectedSlotId === slotId ? null : state.selectedSlotId,
        spreadPhotoIds: state.spreadPhotoIds.map((slots, index) => {
          if (index !== spreadIndex) {
            return slots;
          }
          const next = [...slots];
          next[slotIndex] = null;
          return next;
        })
      };
    }),
  removePhotoFromCanvas: (photoId) =>
    set((state) => {
      const slotSettings = { ...state.slotSettings };
      let selectedSlotId = state.selectedSlotId;
      let changed = false;
      const spreadPhotoIds = state.spreadPhotoIds.map((slots, spreadIndex) => {
        let next: (string | null)[] | null = null;
        slots.forEach((id, slotIndex) => {
          if (id !== photoId) {
            return;
          }
          changed = true;
          next ??= [...slots];
          next[slotIndex] = null;
          const slotId = `page-${Math.floor(slotIndex / PHOTOS_PER_PAGE)}-slot-${slotIndex % PHOTOS_PER_PAGE}`;
          delete slotSettings[slotId];
          if (spreadIndex === state.activeSpreadIndex && selectedSlotId === slotId) {
            selectedSlotId = null;
          }
        });
        return next ?? slots;
      });
      if (!changed) {
        return state;
      }
      return { spreadPhotoIds, slotSettings, selectedSlotId };
    }),
  syncSpreadsWithPhotos: (photosKey, photoIds, leadEmptySlots = 0) => {
    if (get().photosKey === photosKey) {
      return;
    }
    const packedCount = photoIds.length + leadEmptySlots;
    const spreadCount = Math.max(1, Math.ceil(packedCount / SLOTS_PER_SPREAD));
    set({
      photosKey,
      activeSpreadIndex: 0,
      selectedSlotId: null,
      spreadPhotoIds: Array.from({ length: spreadCount }, (_, spreadIndex) =>
        buildSpread(photoIds, spreadIndex, leadEmptySlots)
      )
    });
  }
}));
