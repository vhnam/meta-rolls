export type AlbumPhoto = {
  id: string;
  name: string;
  path: string;
  size: number;
  width: number;
  height: number;
  createdAt: string;
};

export type Album = {
  id: string;
  name: string;
  photos: AlbumPhoto[];
};
