import { Kbd } from '#/components/ui/kbd';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from '#/components/ui/select';
import { formatPreviewZoomLabel, PREVIEW_ZOOM_FIT, PREVIEW_ZOOM_OPTIONS } from '#/utils';
import { cn } from '#/utils/common';

type PreviewZoomSelectProps = {
  value: string | null;
  disabled: boolean;
  onChange: (value: string | null) => void;
  triggerClassName?: string;
};

export function PreviewZoomSelect({
  value,
  disabled,
  onChange,
  triggerClassName
}: PreviewZoomSelectProps) {
  const zoomLabel = formatPreviewZoomLabel(value);
  const isPresetZoom = !value || PREVIEW_ZOOM_OPTIONS.some((option) => option.value === value);
  const selectItems = isPresetZoom
    ? [...PREVIEW_ZOOM_OPTIONS]
    : [...PREVIEW_ZOOM_OPTIONS, { value, label: zoomLabel }];

  return (
    <Select
      disabled={disabled}
      items={selectItems}
      value={value ?? PREVIEW_ZOOM_FIT}
      onValueChange={onChange}
    >
      <SelectTrigger size="sm" variant="ghost" className={cn('h-6', triggerClassName)}>
        <SelectValue size="sm" placeholder="Fit">
          {zoomLabel}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        <SelectItem value={PREVIEW_ZOOM_FIT} indicatorPosition="start">
          Fit
          <Kbd data-icon="inline-end" className="ml-auto translate-x-0.5">
            Z
          </Kbd>
        </SelectItem>
        <SelectSeparator />
        {PREVIEW_ZOOM_OPTIONS.filter((option) => option.value !== PREVIEW_ZOOM_FIT).map(
          (option) => (
            <SelectItem key={option.value} value={option.value} indicatorPosition="start">
              {option.label}
            </SelectItem>
          )
        )}
      </SelectContent>
    </Select>
  );
}
