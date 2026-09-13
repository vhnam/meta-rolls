import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '#/components/ui/select';
import { formatPreviewZoomLabel, PREVIEW_ZOOM_FIT, PREVIEW_ZOOM_OPTIONS } from '#/utils';

type AlbumsPreviewToolbarProps = {
  photoName?: string;
  zoomDisabled: boolean;
  zoomValue: string | null;
  onZoomChange: (value: string | null) => void;
};

export const AlbumsPreviewToolbar = ({
  photoName,
  zoomDisabled,
  zoomValue,
  onZoomChange
}: AlbumsPreviewToolbarProps) => {
  const zoomLabel = formatPreviewZoomLabel(zoomValue);
  const isPresetZoom =
    !zoomValue || PREVIEW_ZOOM_OPTIONS.some((option) => option.value === zoomValue);
  const selectItems = isPresetZoom
    ? [...PREVIEW_ZOOM_OPTIONS]
    : [...PREVIEW_ZOOM_OPTIONS, { value: zoomValue, label: zoomLabel }];

  return (
    <div className="flex h-7 shrink-0 items-center  border-b border-border bg-sidebar-accent px-1">
      <Select
        disabled={zoomDisabled}
        items={selectItems}
        value={zoomValue ?? PREVIEW_ZOOM_FIT}
        onValueChange={onZoomChange}
      >
        <SelectTrigger size="sm" className="h-6 border-transparent bg-transparent shadow-none">
          <SelectValue placeholder="Fit">{zoomLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value={PREVIEW_ZOOM_FIT}>Fit</SelectItem>
          <SelectSeparator />
          {PREVIEW_ZOOM_OPTIONS.filter((option) => option.value !== PREVIEW_ZOOM_FIT).map(
            (option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>
      <div className="text-tiny text-accent-foreground">{photoName}</div>
      <div>&nbsp;</div>
    </div>
  );
};
