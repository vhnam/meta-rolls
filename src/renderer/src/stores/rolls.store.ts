import { create } from 'zustand';

import { ALL_FILTER, ROLL_SORT, type RollSort } from '#/constants/rolls';
import { getApi } from '#/hooks/use-ipc';
import {
  type Camera,
  type DevJob,
  type FilmStock,
  type Lens,
  type Roll,
  type RollFrame,
  type RollPatch,
  type RollStatus
} from '#/shared/rolls';

type RollsState = {
  stocks: FilmStock[];
  cameras: Camera[];
  lenses: Lens[];
  rolls: Roll[];
  selectedRollId: string | null;
  selectedFrameIds: string[];
  frameAnchorId: string | null;
  statusFilter: string;
  stockFilter: string;
  cameraFilter: string;
  search: string;
  sort: RollSort;
};

type RollsActions = {
  loadRolls: () => Promise<void>;
  selectRoll: (rollId: string | null) => void;
  /** Click selects one frame, `toggle` (⌘/Ctrl) adds or removes it, `range` (Shift) extends from the anchor. */
  selectFrame: (frameId: string, mode: 'single' | 'toggle' | 'range', orderedIds: string[]) => void;
  updateFrames: (frameIds: string[], patch: Partial<RollFrame>) => Promise<void>;
  addFrame: (rollId: string) => Promise<void>;
  removeLastFrame: (rollId: string) => Promise<void>;
  setStatusFilter: (value: string) => void;
  setStockFilter: (value: string) => void;
  setCameraFilter: (value: string) => void;
  setSearch: (value: string) => void;
  setSort: (value: RollSort) => void;
  createRolls: (input: {
    stockId: string;
    cameraId?: string | null;
    name?: string;
    quantity?: number;
  }) => Promise<string[]>;
  createStock: (stock: Partial<FilmStock>) => Promise<string>;
  createCamera: (camera: Partial<Camera>) => Promise<string>;
  updateRoll: (rollId: string, patch: RollPatch) => Promise<void>;
  setRollStatus: (rollId: string, status: RollStatus) => Promise<void>;
  duplicateRoll: (rollId: string, quantity: number) => Promise<void>;
  deleteRoll: (rollId: string) => Promise<void>;
  saveDevJob: (job: Partial<DevJob> & { rollId: string }) => Promise<void>;
  deleteDevJob: (id: string) => Promise<void>;
};

export type RollsStore = RollsState & RollsActions;

export const useRollsStore = create<RollsStore>((set, get) => ({
  stocks: [],
  cameras: [],
  lenses: [],
  rolls: [],
  selectedRollId: null,
  selectedFrameIds: [],
  frameAnchorId: null,
  statusFilter: ALL_FILTER,
  stockFilter: ALL_FILTER,
  cameraFilter: ALL_FILTER,
  search: '',
  sort: ROLL_SORT.updated,
  loadRolls: async () => {
    const snapshot = await getApi().rolls.snapshot();
    const selected = get().selectedRollId;
    const frameIds = new Set(snapshot.rolls.flatMap((roll) => roll.frames.map((f) => f.id)));
    const rollStillExists = selected && snapshot.rolls.some((roll) => roll.id === selected);
    set({
      ...snapshot,
      selectedRollId: rollStillExists ? selected : null,
      selectedFrameIds: rollStillExists
        ? get().selectedFrameIds.filter((id) => frameIds.has(id))
        : []
    });
  },
  selectRoll: (selectedRollId) =>
    set({ selectedRollId, selectedFrameIds: [], frameAnchorId: null }),
  selectFrame: (frameId, mode, orderedIds) =>
    set((state) => {
      if (mode === 'toggle') {
        const has = state.selectedFrameIds.includes(frameId);
        return {
          selectedFrameIds: has
            ? state.selectedFrameIds.filter((id) => id !== frameId)
            : [...state.selectedFrameIds, frameId],
          frameAnchorId: frameId
        };
      }
      const anchor = state.frameAnchorId;
      if (mode === 'range' && anchor && orderedIds.includes(anchor)) {
        const from = orderedIds.indexOf(anchor);
        const to = orderedIds.indexOf(frameId);
        const [start, end] = from < to ? [from, to] : [to, from];
        return { selectedFrameIds: orderedIds.slice(start, end + 1) };
      }
      return { selectedFrameIds: [frameId], frameAnchorId: frameId };
    }),
  updateFrames: async (frameIds, patch) => {
    await getApi().rolls.updateFrames(frameIds, patch);
    await get().loadRolls();
  },
  addFrame: async (rollId) => {
    await getApi().rolls.addFrame(rollId);
    await get().loadRolls();
  },
  removeLastFrame: async (rollId) => {
    await getApi().rolls.removeLastFrame(rollId);
    await get().loadRolls();
  },
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setStockFilter: (stockFilter) => set({ stockFilter }),
  setCameraFilter: (cameraFilter) => set({ cameraFilter }),
  setSearch: (search) => set({ search }),
  setSort: (sort) => set({ sort }),
  createRolls: async (input) => {
    const ids = await getApi().rolls.createRoll(input);
    await get().loadRolls();
    set({ selectedRollId: ids[0] ?? null });
    return ids;
  },
  createStock: async (stock) => {
    const id = await getApi().rolls.saveGear({ kind: 'stock', value: stock });
    await get().loadRolls();
    return id;
  },
  createCamera: async (camera) => {
    const id = await getApi().rolls.saveGear({ kind: 'camera', value: camera });
    await get().loadRolls();
    return id;
  },
  updateRoll: async (rollId, patch) => {
    await getApi().rolls.updateRoll(rollId, patch);
    await get().loadRolls();
  },
  setRollStatus: async (rollId, status) => {
    await getApi().rolls.setStatus(rollId, status);
    await get().loadRolls();
  },
  duplicateRoll: async (rollId, quantity) => {
    const roll = get().rolls.find((item) => item.id === rollId);
    if (!roll) {
      return;
    }
    await get().createRolls({
      stockId: roll.stockId,
      cameraId: roll.cameraId,
      quantity
    });
  },
  deleteRoll: async (rollId) => {
    await getApi().rolls.deleteRoll(rollId);
    await get().loadRolls();
  },
  saveDevJob: async (job) => {
    await getApi().rolls.saveDevJob(job);
    await get().loadRolls();
  },
  deleteDevJob: async (id) => {
    await getApi().rolls.deleteDevJob(id);
    await get().loadRolls();
  }
}));

export const hydrateRollsStore = async () => {
  try {
    await useRollsStore.getState().loadRolls();
  } catch (error) {
    console.error('Failed to load rolls from main process', error);
  }
};
