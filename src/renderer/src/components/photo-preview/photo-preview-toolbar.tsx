import { type ReactNode } from 'react';

import { PreviewZoomSelect } from '#/components/preview-zoom-select';
import { cn } from '#/utils/common';

type PhotoPreviewToolbarProps = {
  photoName?: string;
  zoomDisabled: boolean;
  zoomValue: string | null;
  onZoomChange: (value: string | null) => void;
  leading?: ReactNode;
  className?: string;
};

export function PhotoPreviewToolbar({
  photoName,
  zoomDisabled,
  zoomValue,
  onZoomChange,
  leading,
  className
}: PhotoPreviewToolbarProps) {
  return (
    <div className={cn('flex h-7 items-center gap-0.5 border-b', className)}>
      {leading}
      <PreviewZoomSelect value={zoomValue} disabled={zoomDisabled} onChange={onZoomChange} />
      <div className="px-2 text-tiny text-accent-foreground">{photoName}</div>
    </div>
  );
}
