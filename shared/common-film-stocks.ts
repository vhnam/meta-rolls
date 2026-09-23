import { type FilmStock } from './rolls';

export type CommonFilmStock = Omit<FilmStock, 'id' | 'archived'>;

const stock = (
  brand: string,
  name: string,
  iso: number,
  process: FilmStock['process'],
  type: FilmStock['type']
): CommonFilmStock => ({ brand, name, iso, format: '135', exposures: 36, process, type });

/**
 * A short offline list of common 135 stocks, so a stock can be picked without creating it first.
 * Format and exposures can be changed after picking (e.g. for 120).
 */
export const COMMON_FILM_STOCKS: readonly CommonFilmStock[] = [
  stock('Kodak', 'Portra 160', 160, 'c41', 'color-negative'),
  stock('Kodak', 'Portra 400', 400, 'c41', 'color-negative'),
  stock('Kodak', 'Portra 800', 800, 'c41', 'color-negative'),
  stock('Kodak', 'Ektar 100', 100, 'c41', 'color-negative'),
  stock('Kodak', 'Gold 200', 200, 'c41', 'color-negative'),
  stock('Kodak', 'UltraMax 400', 400, 'c41', 'color-negative'),
  stock('Kodak', 'ColorPlus 200', 200, 'c41', 'color-negative'),
  stock('Kodak', 'Ektachrome E100', 100, 'e6', 'slide'),
  stock('Kodak', 'Tri-X 400', 400, 'bw', 'bw'),
  stock('Kodak', 'T-Max 100', 100, 'bw', 'bw'),
  stock('Kodak', 'T-Max 400', 400, 'bw', 'bw'),
  stock('Fujifilm', 'Superia X-TRA 400', 400, 'c41', 'color-negative'),
  stock('Fujifilm', 'C200', 200, 'c41', 'color-negative'),
  stock('Fujifilm', 'Provia 100F', 100, 'e6', 'slide'),
  stock('Fujifilm', 'Velvia 50', 50, 'e6', 'slide'),
  stock('Fujifilm', 'Velvia 100', 100, 'e6', 'slide'),
  stock('Ilford', 'HP5 Plus 400', 400, 'bw', 'bw'),
  stock('Ilford', 'FP4 Plus 125', 125, 'bw', 'bw'),
  stock('Ilford', 'Delta 100', 100, 'bw', 'bw'),
  stock('Ilford', 'Delta 400', 400, 'bw', 'bw'),
  stock('Ilford', 'Delta 3200', 3200, 'bw', 'bw'),
  stock('Ilford', 'Pan F Plus 50', 50, 'bw', 'bw'),
  stock('CineStill', '800T', 800, 'c41', 'color-negative'),
  stock('CineStill', '50D', 50, 'c41', 'color-negative'),
  stock('Lomography', 'Color Negative 400', 400, 'c41', 'color-negative')
];

export const commonStockLabel = (item: CommonFilmStock): string => `${item.brand} ${item.name}`;
