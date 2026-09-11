export type PhotoFolder = {
  id: string;
  name: string;
  kind?: 'disk' | 'folder';
  children?: PhotoFolder[];
};

export type PhotoItem = {
  id: string;
  folderId: string;
  name: string;
  date: string;
  camera: string;
  accent: string;
};

export const PHOTO_FOLDERS: PhotoFolder[] = [
  {
    id: 'macintosh-hd',
    name: 'Macintosh HD',
    kind: 'disk',
    children: [
      { id: 'users', name: 'Users' },
      { id: 'system', name: 'System' },
      { id: 'library', name: 'Library' },
      { id: 'applications', name: 'Applications' },
      {
        id: 'pictures',
        name: 'Pictures',
        children: [
          { id: '2024', name: '2024' },
          { id: '2025', name: '2025' }
        ]
      },
      { id: 'downloads', name: 'Downloads' }
    ]
  },
  {
    id: 'icloud',
    name: 'iCloud Drive',
    kind: 'disk',
    children: [{ id: 'icloud-photos', name: 'Photos' }]
  },
  {
    id: 'sd-card',
    name: 'SD Card',
    kind: 'disk',
    children: [{ id: 'dcim', name: 'DCIM' }]
  }
];

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

export const findFolder = (
  folders: PhotoFolder[],
  folderId: string
): PhotoFolder | undefined => {
  for (const folder of folders) {
    if (folder.id === folderId) {
      return folder;
    }
    if (folder.children) {
      const match = findFolder(folder.children, folderId);
      if (match) {
        return match;
      }
    }
  }
  return undefined;
};

export const ALBUM_LIBRARIES = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' }
] as const;
