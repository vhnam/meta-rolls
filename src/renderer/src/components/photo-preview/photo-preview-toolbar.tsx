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
      <div className="px-2 text-tiny text-accent-foreground">{photoName}</div>
    </div>
  );
}
