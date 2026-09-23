import { IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';

import { Button } from '#/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '#/components/ui/dialog';
import { type Roll, planScanLink } from '#/shared/rolls';
import { useRollsStore } from '#/stores/rolls.store';

type ScanLinkDialogProps = {
  roll: Roll;
  folder: string;
  files: { name: string; path: string }[];
  onClose: () => void;
};

/** Previews how a folder's files map onto the roll's frames before anything is saved. */
export function ScanLinkDialog({ roll, folder, files, onClose }: ScanLinkDialogProps) {
  const linkScans = useRollsStore((state) => state.linkScans);
  const [saving, setSaving] = useState(false);
  const plan = planScanLink(files, roll.frames);
  const extra = plan.extraFiles.length;
  const alreadyLinked = roll.frames.some((frame) => frame.scanPath);

  const link = async (addFrames: boolean) => {
    setSaving(true);
    try {
      const chosen = addFrames ? [...plan.pairs, ...plan.extraFiles] : plan.pairs;
      await linkScans(
        roll.id,
        folder,
        chosen.map((item) => item.path),
        addFrames
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link scans</DialogTitle>
          <DialogDescription>
            <span className="block truncate" title={folder}>
              {folder}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4 text-xs">
          <p>
            {files.length} files · {roll.frames.length} frames. Files are matched to frames in
            filename order.
          </p>
          {files.length === 0 && (
            <p className="text-destructive">This folder has no supported image files.</p>
          )}
          {extra > 0 && (
            <p className="flex items-center gap-1.5 text-destructive">
              <IconAlertTriangle className="size-3.5 shrink-0" />
              {extra} more {extra === 1 ? 'file' : 'files'} than frames.
            </p>
          )}
          {plan.emptyFrameNumbers.length > 0 && files.length > 0 && (
            <p className="flex items-center gap-1.5 text-destructive">
              <IconAlertTriangle className="size-3.5 shrink-0" />
              {plan.emptyFrameNumbers.length} frames will have no scan (frame{' '}
              {plan.emptyFrameNumbers[0]}
              {plan.emptyFrameNumbers.length > 1 ? ' onward' : ''}).
            </p>
          )}
          {alreadyLinked && (
            <p className="text-muted-foreground">This replaces the roll&apos;s current links.</p>
          )}
          <ul className="max-h-48 overflow-auto border border-border">
            {plan.pairs.map((pair) => (
              <li
                key={pair.frameId}
                className="flex justify-between gap-2 border-b border-border px-2 py-1 last:border-b-0"
              >
                <span className="text-muted-foreground">Frame {pair.frameNumber}</span>
                <span className="truncate">{pair.name}</span>
              </li>
            ))}
            {plan.extraFiles.map((file) => (
              <li
                key={file.path}
                className="flex justify-between gap-2 border-b border-border px-2 py-1 text-muted-foreground last:border-b-0"
              >
                <span>No frame</span>
                <span className="truncate">{file.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {extra > 0 && (
            <Button variant="outline" disabled={saving} onClick={() => void link(false)}>
              Link {plan.pairs.length} files only
            </Button>
          )}
          <Button disabled={saving || files.length === 0} onClick={() => void link(extra > 0)}>
            {extra > 0 ? `Add ${extra} frames and link` : 'Link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
