import { IconAlertTriangle, IconFolder } from '@tabler/icons-react';
import { useState } from 'react';

import { Button } from '#/components/ui/button';
import { getApi } from '#/hooks/use-ipc';
import { type Roll, type RollScanStatus } from '#/shared/rolls';
import { useRollsStore } from '#/stores/rolls.store';

import { ScanLinkDialog } from './scan-link-dialog';

type RollScansProps = {
  roll: Roll;
  status: RollScanStatus | null;
};

type Pending = { folder: string; files: { name: string; path: string }[] };

export function RollScans({ roll, status }: RollScansProps) {
  const unlinkScans = useRollsStore((state) => state.unlinkScans);
  const [pending, setPending] = useState<Pending | null>(null);
  const linked = roll.frames.filter((frame) => frame.scanPath).length;

  const chooseFolder = async () => {
    const folder = await getApi().rolls.chooseScanFolder();
    if (!folder) {
      return;
    }
    const listing = await getApi().media.listFolder(folder);
    setPending({
      folder,
      files: listing.files.map((file) => ({ name: file.name, path: file.path }))
    });
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium">Scans</h3>
        <div className="flex items-center gap-1">
          <Button size="xs" variant="outline" onClick={() => void chooseFolder()}>
            <IconFolder /> {roll.scanFolder ? 'Change folder' : 'Link scans'}
          </Button>
          {roll.scanFolder && (
            <Button size="xs" variant="ghost" onClick={() => void unlinkScans(roll.id)}>
              Unlink
            </Button>
          )}
        </div>
      </div>
      {roll.scanFolder ? (
        <>
          <p className="truncate text-xs text-muted-foreground" title={roll.scanFolder}>
            {roll.scanFolder} · {linked} of {roll.frames.length} frames linked
          </p>
          {status?.folderMissing && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <IconAlertTriangle className="size-3.5 shrink-0" />
              The linked folder no longer exists. Change the folder or unlink it.
            </p>
          )}
          {!status?.folderMissing && status && status.missingPaths.length > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <IconAlertTriangle className="size-3.5 shrink-0" />
              {status.missingPaths.length} linked{' '}
              {status.missingPaths.length === 1 ? 'file is' : 'files are'} missing.
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          No scans linked. Photos stay where they are; nothing is copied or changed.
        </p>
      )}
      {pending && (
        <ScanLinkDialog
          key={pending.folder}
          roll={roll}
          folder={pending.folder}
          files={pending.files}
          onClose={() => setPending(null)}
        />
      )}
    </section>
  );
}
