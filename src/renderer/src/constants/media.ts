import type { Album, PhotoItem } from '#/types/media';

export const FOLDER_KIND = {
  disk: 'disk',
  folder: 'folder'
} as const;

export const MEDIA_VIEW = {
  list: 'list',
  grid: 'grid'
} as const;

export const DEFAULT_PHOTO_ACCENT = 'oklch(0.62 0.12 250)';

export const PHOTO_ITEMS: PhotoItem[] = [
  {
    id: 'p1',
    folderId: '2025',
    name: 'DSC_0142.jpg',
    date: '2025-04-12',
    camera: 'X100VI',
    accent: 'oklch(0.62 0.12 250)'
  },
  {
    id: 'p2',
    folderId: '2025',
    name: 'DSC_0143.jpg',
    date: '2025-04-12',
    camera: 'X100VI',
    accent: 'oklch(0.68 0.14 70)'
  },
  {
    id: 'p3',
    folderId: '2025',
    name: 'IMG_8810.heic',
    date: '2025-06-02',
    camera: 'iPhone',
    accent: 'oklch(0.55 0.08 150)'
  },
  {
    id: 'p4',
    folderId: '2024',
    name: 'Rollei_0021.jpg',
    date: '2024-11-08',
    camera: 'Rollei 35',
    accent: 'oklch(0.58 0.1 30)'
  },
  {
    id: 'p5',
    folderId: 'downloads',
    name: 'scan-tokyo-01.tif',
    date: '2024-09-18',
    camera: 'Scanner',
    accent: 'oklch(0.5 0.04 280)'
  }
];

export const ALBUM_ITEMS: Album[] = [] as const;
