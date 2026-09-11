import { create } from 'zustand';
import { DEFAULT_SLOT_SETTINGS } from '#/constants/canvas';
import { type SlotFit, type SlotSettings } from '#/types';

type CanvasState = {
  selectedSlotId: string | null;
  slotSettings: Record<string, SlotSettings>;
};

type CanvasActions = {
  selectSlot: (slotId: string | null) => void;
  setSlotFit: (slotId: string, fit: SlotFit) => void;
  setSlotCrop: (slotId: string, crop: Pick<SlotSettings, 'cropX' | 'cropY' | 'cropZoom'>) => void;
  resetSlot: (slotId: string) => void;
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

export const useCanvasStore = create<CanvasStore>((set) => ({
  selectedSlotId: null,
  slotSettings: {},
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
    })
}));
