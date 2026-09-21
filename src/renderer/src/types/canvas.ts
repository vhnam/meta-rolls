export type SlotFit = 'cover' | 'contain';

export type SlotSettings = {
  fit: SlotFit;
  cropX: number;
  cropY: number;
  cropZoom: number;
  imageRotationDeg: number;
};
