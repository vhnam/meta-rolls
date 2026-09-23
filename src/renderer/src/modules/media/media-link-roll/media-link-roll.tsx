import { useState } from 'react';

import { OptionSelect } from '#/components/option-select';
import { ScanLinkDialog } from '#/components/scan-link-dialog';
import { Button } from '#/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '#/components/ui/dialog';
import { Field, FieldLabel } from '#/components/ui/field';
import { getApi } from '#/hooks/use-ipc';
import { useRollsStore } from '#/stores/rolls.store';

type Files = { name: string; path: string }[];

function MediaLinkRollDialog({ folder }: { folder: string }) {
  const rolls = useRollsStore((state) => state.rolls);
  const stocks = useRollsStore((state) => state.stocks);
  const requestLinkFolder = useRollsStore((state) => state.requestLinkFolder);
  const [rollId, setRollId] = useState(rolls[0]?.id ?? '');
  const [files, setFiles] = useState<Files | null>(null);

  const close = () => requestLinkFolder(null);
  const roll = rolls.find((item) => item.id === rollId);

  const labelFor = (id: string) => {
    const item = rolls.find((r) => r.id === id);
    const stock = stocks.find((s) => s.id === item?.stockId);
    return `${item?.name ?? ''}${stock ? ` · ${stock.brand} ${stock.name}` : ''}`;
  };

  const next = async () => {
    const listing = await getApi().media.listFolder(folder);
    setFiles(listing.files.map((file) => ({ name: file.name, path: file.path })));
  };

  if (files && roll) {
    return <ScanLinkDialog roll={roll} folder={folder} files={files} onClose={close} />;
  }

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link to roll</DialogTitle>
          <DialogDescription>
            <span className="block truncate" title={folder}>
              {folder}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {rolls.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No rolls yet. Add a roll in the Rolls tab first.
            </p>
          ) : (
            <Field>
              <FieldLabel>Roll</FieldLabel>
              <OptionSelect
                value={rollId}
                onChange={setRollId}
                options={rolls.map((item) => ({ value: item.id, label: labelFor(item.id) }))}
              />
            </Field>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button disabled={!roll} onClick={() => void next()}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Mounted once on the Media screen; opens when a folder's "Link to roll…" is chosen. */
export function MediaLinkRoll() {
  const folder = useRollsStore((state) => state.linkFolderRequest);
  return folder ? <MediaLinkRollDialog key={folder} folder={folder} /> : null;
}
