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
      <SelectTrigger
        size="sm"
        className={cn('h-6 border-transparent bg-transparent shadow-none', triggerClassName)}
      >
        <SelectValue className="text-tiny" placeholder="Fit">
          {zoomLabel}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align="start"
        className="**:data-[slot=select-item]:pr-2 **:data-[slot=select-item]:pl-8 **:data-[slot=select-item]:[&_.absolute]:right-auto **:data-[slot=select-item]:[&_.absolute]:left-2"
      >
        <SelectItem value={PREVIEW_ZOOM_FIT}>
          Fit
          <Kbd data-icon="inline-end" className="ml-auto translate-x-0.5">
            Z
          </Kbd>
        </SelectItem>
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
  );
}
