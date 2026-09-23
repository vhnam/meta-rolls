import { create } from 'zustand';

import { ALL_FILTER, ROLL_SORT, type RollSort } from '#/constants/rolls';
import { getApi } from '#/hooks/use-ipc';
import {
  type Camera,
  type DevJob,
  type FilmStock,
  type Lens,
  type Roll,
  type RollPatch,
  type RollStatus
} from '#/shared/rolls';

type RollsState = {
  stocks: FilmStock[];
  cameras: Camera[];
  lenses: Lens[];
  rolls: Roll[];
  selectedRollId: string | null;
  statusFilter: string;
  stockFilter: string;
  cameraFilter: string;
  search: string;
  sort: RollSort;
};

type RollsActions = {
  loadRolls: () => Promise<void>;
  selectRoll: (rollId: string | null) => void;
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
  statusFilter: ALL_FILTER,
  stockFilter: ALL_FILTER,
  cameraFilter: ALL_FILTER,
  search: '',
  sort: ROLL_SORT.updated,
  loadRolls: async () => {
    const snapshot = await getApi().rolls.snapshot();
    const selected = get().selectedRollId;
    set({
      ...snapshot,
      selectedRollId:
        selected && snapshot.rolls.some((roll) => roll.id === selected) ? selected : null
    });
  },
  selectRoll: (selectedRollId) => set({ selectedRollId }),
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
