import { PreviewZoomSelect } from '#/components/preview-zoom-select';
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
  return (
    <div className={cn('flex h-7 items-center border-b', className)}>
      <PreviewZoomSelect value={zoomValue} disabled={zoomDisabled} onChange={onZoomChange} />
      <div className="px-2 text-tiny text-accent-foreground">{photoName}</div>
    </div>
  );
}
