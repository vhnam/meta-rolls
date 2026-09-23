import {
  IconFileTypePdf,
  IconLayoutSidebarRight,
  IconLayoutSidebarRightFilled,
  IconRotate2,
  IconRotateClockwise
} from '@tabler/icons-react';
import { useState } from 'react';

import { Button } from '#/components/ui/button';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet
} from '#/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '#/components/ui/select';
import { Switch } from '#/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { PRINT_FORMAT } from '#/constants/settings';
import { useAlbumStore } from '#/stores/album.store';
import { type AlbumPageRotationDeg, type InstaxPrintFormat, type PaperPrintFormat } from '#/types';

const rotateBy = (rotationDeg: AlbumPageRotationDeg, deltaDeg: -90 | 90): AlbumPageRotationDeg =>
  ((((rotationDeg + deltaDeg) % 360) + 360) % 360) as AlbumPageRotationDeg;

const PAGE_SIZE_NONE = 'auto';

const PAGE_PRESET_OPTIONS = [
  { value: PRINT_FORMAT.instaxMini, label: 'Instax Mini' },
  { value: PRINT_FORMAT.instaxWide, label: 'Instax Wide' }
] as const;

const PAGE_SIZE_OPTIONS = [
  { value: PAGE_SIZE_NONE, label: 'Auto' },
  { value: PRINT_FORMAT.a4, label: 'A4' },
  { value: PRINT_FORMAT.a5, label: 'A5' },
  { value: PRINT_FORMAT.letter, label: 'Letter' }
] as const;

type DeliverCanvasSidebarProps = {
  albumId: string | null;
  pagePreset: InstaxPrintFormat;
  pageSize: PaperPrintFormat | null;
  pageRotationDeg: AlbumPageRotationDeg;
  showPageNumbers: boolean;
  leftHandFirst: boolean;
  isExporting: boolean;
  onExport: () => void;
};

export function DeliverCanvasSidebar({
  albumId,
  pagePreset,
  pageSize,
  pageRotationDeg,
  showPageNumbers,
  leftHandFirst,
  isExporting,
  onExport
}: DeliverCanvasSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const updatePrintConfig = useAlbumStore((state) => state.updatePrintConfig);

  const persistPrintConfig = (patch: {
    pagePreset?: InstaxPrintFormat;
    pageSize?: PaperPrintFormat | null;
    pageRotationDeg?: AlbumPageRotationDeg;
    showPageNumbers?: boolean;
    leftHandFirst?: boolean;
  }) => {
    if (!albumId) {
      return;
    }
    void updatePrintConfig(albumId, {
      pagePreset: patch.pagePreset ?? pagePreset,
      pageSize: patch.pageSize !== undefined ? patch.pageSize : pageSize,
      pageRotationDeg: patch.pageRotationDeg ?? pageRotationDeg,
      showPageNumbers: patch.showPageNumbers ?? showPageNumbers,
      leftHandFirst: patch.leftHandFirst ?? leftHandFirst
    });
  };

  const handlePagePresetChange = (value: string | null) => {
    if (value) {
      persistPrintConfig({ pagePreset: value as InstaxPrintFormat });
    }
  };
  const handlePageSizeChange = (value: string | null) => {
    persistPrintConfig({
      pageSize: value && value !== PAGE_SIZE_NONE ? (value as PaperPrintFormat) : null
    });
  };

  const handleRotateCounterclockwise = () => {
    persistPrintConfig({ pageRotationDeg: rotateBy(pageRotationDeg, -90) });
  };
  const handleRotateClockwise = () => {
    persistPrintConfig({ pageRotationDeg: rotateBy(pageRotationDeg, 90) });
  };

  const handleShowPageNumbersChange = (checked: boolean) => {
    persistPrintConfig({ showPageNumbers: checked });
  };

  const handleLeftHandFirstChange = (checked: boolean) => {
    persistPrintConfig({ leftHandFirst: checked });
  };

  if (collapsed) {
    return (
      <div className="flex w-7 shrink-0 flex-col items-center border-l border-border bg-card">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="mt-1"
                aria-pressed={false}
                onClick={() => setCollapsed(false)}
              />
            }
          >
            <IconLayoutSidebarRight />
          </TooltipTrigger>
          <TooltipContent>Show settings</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex w-48 shrink-0 flex-col border-l border-border bg-card">
      <div className="flex h-7 shrink-0 items-center justify-between border-b border-border bg-muted px-2">
        <span className="text-tiny font-medium text-foreground">Settings</span>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                aria-pressed
                onClick={() => setCollapsed(true)}
              />
            }
          >
            <IconLayoutSidebarRightFilled />
          </TooltipTrigger>
          <TooltipContent>Hide settings</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-3">
        <FieldGroup size="compact" className="min-h-0 flex-1">
          <FieldSet>
            <FieldLegend variant="label">Page</FieldLegend>
            <FieldGroup size="compact">
              <Field>
                <FieldLabel htmlFor="deliver-page-preset" size="compact">
                  Page preset
                </FieldLabel>
                <Select
                  items={PAGE_PRESET_OPTIONS}
                  value={pagePreset}
                  disabled={!albumId}
                  onValueChange={handlePagePresetChange}
                >
                  <SelectTrigger id="deliver-page-preset" size="sm" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_PRESET_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="deliver-page-size" size="compact">
                  Page size
                </FieldLabel>
                <Select
                  items={PAGE_SIZE_OPTIONS}
                  value={pageSize ?? PAGE_SIZE_NONE}
                  disabled={!albumId}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger id="deliver-page-size" size="sm" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field data-disabled={!albumId}>
                <FieldLabel size="compact">Rotate</FieldLabel>
                <div className="flex items-center gap-1.5">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          disabled={!albumId}
                          onClick={handleRotateCounterclockwise}
                        />
                      }
                    >
                      <IconRotate2 />
                    </TooltipTrigger>
                    <TooltipContent>Rotate counterclockwise</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          disabled={!albumId}
                          onClick={handleRotateClockwise}
                        />
                      }
                    >
                      <IconRotateClockwise />
                    </TooltipTrigger>
                    <TooltipContent>Rotate clockwise</TooltipContent>
                  </Tooltip>
                </div>
              </Field>

              <Field orientation="horizontal" data-disabled={!albumId}>
                <Switch
                  id="deliver-page-numbers"
                  size="sm"
                  checked={showPageNumbers}
                  disabled={!albumId}
                  onCheckedChange={handleShowPageNumbersChange}
                />
                <FieldLabel htmlFor="deliver-page-numbers" size="compact">
                  Page numbers
                </FieldLabel>
              </Field>

              <Field orientation="horizontal" data-disabled={!albumId}>
                <Switch
                  id="deliver-left-hand-first"
                  size="sm"
                  checked={leftHandFirst}
                  disabled={!albumId}
                  onCheckedChange={handleLeftHandFirstChange}
                />
                <FieldLabel htmlFor="deliver-left-hand-first" size="compact">
                  Left-hand first
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          <Field className="mt-auto">
            <Button
              type="button"
              size="sm"
              className="w-full"
              disabled={!albumId || isExporting}
              onClick={onExport}
            >
              <IconFileTypePdf data-icon="inline-start" />
              {isExporting ? 'Exporting…' : 'Export'}
            </Button>
          </Field>
        </FieldGroup>
      </div>
    </div>
  );
}
