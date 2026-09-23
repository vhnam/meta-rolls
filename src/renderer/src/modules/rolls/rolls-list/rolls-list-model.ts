import { ALL_FILTER, ROLL_SORT, type RollSort } from '#/constants/rolls';
import { type Camera, type FilmStock, type Roll, type RollStatus } from '#/shared/rolls';
import { ROLL_STATUSES } from '#/shared/rolls';

export type RollsFilters = {
  status: string;
  stock: string;
  camera: string;
  search: string;
  sort: RollSort;
};

export const stockLabel = (stock: FilmStock | undefined) =>
  stock ? `${stock.brand} ${stock.name}`.trim() : 'Unknown stock';

export const cameraLabel = (camera: Camera | undefined) =>
  camera ? `${camera.brand} ${camera.model}`.trim() : '';

/** The date that matters most for a roll's current status. */
export const relevantDate = (roll: Roll): string | null => {
  switch (roll.status) {
    case 'loaded':
      return roll.loadedAt;
    case 'shot':
      return roll.finishedAt;
    case 'developing':
      return roll.devJobs.find((job) => job.sentAt)?.sentAt ?? null;
    case 'developed':
      return roll.devJobs.find((job) => job.receivedAt)?.receivedAt ?? null;
    default:
      return roll.expiryAt;
  }
};

export const filterRolls = (
  rolls: Roll[],
  stocks: FilmStock[],
  cameras: Camera[],
  filters: RollsFilters
): Roll[] => {
  const query = filters.search.trim().toLowerCase();
  const stockById = new Map(stocks.map((stock) => [stock.id, stock]));
  const cameraById = new Map(cameras.map((camera) => [camera.id, camera]));

  const matches = rolls.filter((roll) => {
    if (filters.status !== ALL_FILTER && roll.status !== filters.status) {
      return false;
    }
    if (filters.stock !== ALL_FILTER && roll.stockId !== filters.stock) {
      return false;
    }
    if (filters.camera !== ALL_FILTER && roll.cameraId !== filters.camera) {
      return false;
    }
    if (!query) {
      return true;
    }
    const haystack = [
      roll.name,
      stockLabel(stockById.get(roll.stockId)),
      cameraLabel(cameraById.get(roll.cameraId ?? '')),
      roll.notes
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  });

  return matches.sort((a, b) => {
    if (filters.sort === ROLL_SORT.name) {
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    }
    if (filters.sort === ROLL_SORT.loaded) {
      return (b.loadedAt ?? '').localeCompare(a.loadedAt ?? '');
    }
    return b.updatedAt - a.updatedAt;
  });
};

export const groupByStatus = (rolls: Roll[]): { status: RollStatus; rolls: Roll[] }[] =>
  ROLL_STATUSES.map((status) => ({
    status,
    rolls: rolls.filter((roll) => roll.status === status)
  })).filter((group) => group.rolls.length > 0);
