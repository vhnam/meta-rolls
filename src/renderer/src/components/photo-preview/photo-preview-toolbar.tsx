import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '#/components/ui/select';
import { cn } from '#/lib/utils';
import { formatPreviewZoomLabel, PREVIEW_ZOOM_FIT, PREVIEW_ZOOM_OPTIONS } from '#/utils';

type PhotoPreviewToolbarProps = {
  photoName?: string;
  zoomDisabled: boolean;
  zoomValue: string | null;
  onZoomChange: (value: string | null) => void;
  className?: string;
};

export function PhotoPreviewToolbar({
  photoName,
  zoomDisabled,
  zoomValue,
  onZoomChange,
  className
}: PhotoPreviewToolbarProps) {
  const zoomLabel = formatPreviewZoomLabel(zoomValue);
  const isPresetZoom =
    !zoomValue || PREVIEW_ZOOM_OPTIONS.some((option) => option.value === zoomValue);
  const selectItems = isPresetZoom
    ? [...PREVIEW_ZOOM_OPTIONS]
    : [...PREVIEW_ZOOM_OPTIONS, { value: zoomValue, label: zoomLabel }];

  return (
    <div className={cn('flex h-7 items-center border-b', className)}>
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
}
