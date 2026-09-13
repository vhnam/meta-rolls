export const PREVIEW_ZOOM_FIT = 'fit';

export const PREVIEW_ZOOM_OPTIONS = [
  { value: PREVIEW_ZOOM_FIT, label: 'Fit' },
  { value: '25', label: '25%' },
  { value: '50', label: '50%' },
  { value: '75', label: '75%' },
  { value: '100', label: '100%' },
  { value: '200', label: '200%' },
  { value: '300', label: '300%' }
] as const;

export type PreviewZoomValue = (typeof PREVIEW_ZOOM_OPTIONS)[number]['value'];

const FIT_SCALE_TOLERANCE = 0.02;
const PERCENT_TOLERANCE = 2;

const layoutWidth = (image: HTMLImageElement) => image.offsetWidth;
const naturalWidth = (image: HTMLImageElement) => image.naturalWidth;

export const panzoomScaleForPreviewZoom = (value: string, image: HTMLImageElement) => {
  if (value === PREVIEW_ZOOM_FIT) {
    return null;
  }

  const percent = Number(value);
  const layout = layoutWidth(image);
  const natural = naturalWidth(image);
  if (!Number.isFinite(percent) || layout <= 0 || natural <= 0) {
    return null;
  }

  return (percent / 100) * (natural / layout);
};

export const previewZoomFromPanzoomScale = (scale: number, image: HTMLImageElement) => {
  if (Math.abs(scale - 1) < FIT_SCALE_TOLERANCE) {
    return PREVIEW_ZOOM_FIT;
  }

  const layout = layoutWidth(image);
  const natural = naturalWidth(image);
  if (layout <= 0 || natural <= 0) {
    return PREVIEW_ZOOM_FIT;
  }

  const percent = (scale * layout * 100) / natural;
  const match = PREVIEW_ZOOM_OPTIONS.find(
    (option) =>
      option.value !== PREVIEW_ZOOM_FIT &&
      Math.abs(Number(option.value) - percent) < PERCENT_TOLERANCE
  );

  return match?.value ?? String(Math.round(percent));
};

export const formatPreviewZoomLabel = (value: string | null) => {
  if (!value || value === PREVIEW_ZOOM_FIT) {
    return 'Fit';
  }

  const match = PREVIEW_ZOOM_OPTIONS.find((option) => option.value === value);
  if (match) {
    return match.label;
  }

  const percent = Number(value);
  if (!Number.isFinite(percent)) {
    return 'Fit';
  }

  return `${Math.round(percent)}%`;
};
