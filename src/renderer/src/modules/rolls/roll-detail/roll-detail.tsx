import { IconAlertTriangle, IconCopy, IconTrash } from '@tabler/icons-react';
import { IconMovie } from '@tabler/icons-react';
import { useState } from 'react';

import { Button } from '#/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyMedia } from '#/components/ui/empty';
import { Field, FieldLabel } from '#/components/ui/field';
import { ROLL_STATUS_ACTION, ROLL_STATUS_LABEL } from '#/constants/rolls';
import {
  ROLL_STATUSES,
  type DevJob,
  type Roll,
  formatPushPull,
  isFormatMismatch,
  nextRollStatus,
  pushPullStops
} from '#/shared/rolls';
import { useRollsStore } from '#/stores/rolls.store';

import { DevJobDialog, RollDevJobs } from '../roll-dev-jobs';
import { RollFrameGrid } from '../roll-frames';
import { RollsField } from '../rolls-field';
import { cameraLabel, stockLabel } from '../rolls-list/rolls-list-model';
import { RollsOptionSelect } from '../rolls-option-select';

const NONE = 'none';

export function RollDetail() {
  const roll = useRollsStore((state) => state.rolls.find((r) => r.id === state.selectedRollId));

  if (!roll) {
    return (
      <Empty className="h-full">
        <EmptyMedia variant="icon">
          <IconMovie />
        </EmptyMedia>
        <EmptyContent>
          <EmptyDescription>Select a roll to see its details</EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }
  return <RollDetailBody key={roll.id} roll={roll} />;
}

function RollDetailBody({ roll }: { roll: Roll }) {
  const stocks = useRollsStore((state) => state.stocks);
  const cameras = useRollsStore((state) => state.cameras);
  const lenses = useRollsStore((state) => state.lenses);
  const updateRoll = useRollsStore((state) => state.updateRoll);
  const setRollStatus = useRollsStore((state) => state.setRollStatus);
  const duplicateRoll = useRollsStore((state) => state.duplicateRoll);
  const deleteRoll = useRollsStore((state) => state.deleteRoll);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  // `undefined` = closed, `null` = adding a new job, a job = editing it.
  const [devJobDialog, setDevJobDialog] = useState<DevJob | null | undefined>(undefined);

  const stock = stocks.find((s) => s.id === roll.stockId);
  const camera = cameras.find((c) => c.id === roll.cameraId);
  const next = nextRollStatus(roll.status);
  const stops = stock ? pushPullStops(stock.iso, roll.shotIso) : 0;
  const changeStatus = async (status: Roll['status']) => {
    await setRollStatus(roll.id, status);
    // Sending a roll to the lab is the moment to record the dev job; the user can skip it.
    if (status === 'developing' && roll.devJobs.length === 0) {
      setDevJobDialog(null);
    }
  };
  const pushPull = formatPushPull(stops);
  const mismatch = stock && camera && isFormatMismatch(stock.format, camera.format);

  // Archived gear stays selectable on the rolls that already use it.
  const visible = <T extends { id: string; archived: boolean }>(
    items: T[],
    current: string | null
  ) => items.filter((item) => !item.archived || item.id === current);

  return (
    <div className="h-full overflow-auto p-4">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <header className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <RollsField
              label="Roll name"
              value={roll.name}
              onCommit={(name) => name.trim() && void updateRoll(roll.id, { name: name.trim() })}
            />
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {stockLabel(stock)} · {ROLL_STATUS_LABEL[roll.status]}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 pt-5">
            <Button size="sm" variant="outline" onClick={() => void duplicateRoll(roll.id, 1)}>
              <IconCopy /> Duplicate
            </Button>
            {confirmingDelete ? (
              <>
                <Button size="sm" variant="destructive" onClick={() => void deleteRoll(roll.id)}>
                  Delete roll
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmingDelete(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Delete roll"
                onClick={() => setConfirmingDelete(true)}
              >
                <IconTrash />
              </Button>
            )}
          </div>
        </header>

        <section className="flex flex-wrap items-end gap-2">
          <Field className="w-44">
            <FieldLabel>Status</FieldLabel>
            <RollsOptionSelect
              value={roll.status}
              onChange={(status) => void changeStatus(status as Roll['status'])}
              options={ROLL_STATUSES.map((s) => ({ value: s, label: ROLL_STATUS_LABEL[s] }))}
            />
          </Field>
          {next && (
            <Button size="sm" onClick={() => void changeStatus(next)}>
              {ROLL_STATUS_ACTION[next]}
            </Button>
          )}
        </section>

        {mismatch && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <IconAlertTriangle className="size-3.5" />
            This stock is {stock.format} but {cameraLabel(camera)} takes {camera.format}.
          </p>
        )}

        <section className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel>Film stock</FieldLabel>
            <RollsOptionSelect
              value={roll.stockId}
              onChange={(stockId) => void updateRoll(roll.id, { stockId })}
              options={visible(stocks, roll.stockId).map((s) => ({
                value: s.id,
                label: stockLabel(s)
              }))}
            />
          </Field>
          <Field>
            <FieldLabel>Camera</FieldLabel>
            <RollsOptionSelect
              value={roll.cameraId ?? NONE}
              onChange={(id) => void updateRoll(roll.id, { cameraId: id === NONE ? null : id })}
              options={[
                { value: NONE, label: 'No camera' },
                ...visible(cameras, roll.cameraId).map((c) => ({
                  value: c.id,
                  label: cameraLabel(c)
                }))
              ]}
            />
          </Field>
          <Field>
            <FieldLabel>Default lens</FieldLabel>
            <RollsOptionSelect
              value={roll.lensId ?? NONE}
              onChange={(id) => void updateRoll(roll.id, { lensId: id === NONE ? null : id })}
              options={[
                { value: NONE, label: 'No lens' },
                ...visible(lenses, roll.lensId).map((l) => ({ value: l.id, label: l.name }))
              ]}
            />
          </Field>
          <RollsField
            label="Exposures"
            type="number"
            value={String(roll.exposures)}
            onCommit={(value) => {
              const exposures = Math.floor(Number(value));
              // Frames are only ever added here; removing scanned frames is a separate action.
              if (exposures > 0 && exposures >= roll.exposures) {
                void updateRoll(roll.id, { exposures });
              }
            }}
          />
          <div>
            <RollsField
              label="Shot ISO"
              type="number"
              value={String(roll.shotIso)}
              onCommit={(value) =>
                Number(value) > 0 && void updateRoll(roll.id, { shotIso: Number(value) })
              }
            />
            {pushPull && <p className="mt-1 text-xs text-muted-foreground">{pushPull}</p>}
          </div>
          <RollsField
            label="Expiry date"
            type="date"
            value={roll.expiryAt ?? ''}
            onCommit={(value) => void updateRoll(roll.id, { expiryAt: value || null })}
          />
          <RollsField
            label="Loaded"
            type="date"
            value={roll.loadedAt ?? ''}
            onCommit={(value) => void updateRoll(roll.id, { loadedAt: value || null })}
          />
          <RollsField
            label="Finished"
            type="date"
            value={roll.finishedAt ?? ''}
            onCommit={(value) => void updateRoll(roll.id, { finishedAt: value || null })}
          />
          <div className="col-span-2">
            <RollsField
              label="Notes"
              value={roll.notes}
              onCommit={(notes) => void updateRoll(roll.id, { notes })}
            />
          </div>
        </section>

        <RollDevJobs
          roll={roll}
          onAdd={() => setDevJobDialog(null)}
          onEdit={(job) => setDevJobDialog(job)}
        />
        {devJobDialog !== undefined && (
          <DevJobDialog
            key={devJobDialog?.id ?? 'new'}
            rollId={roll.id}
            job={devJobDialog}
            defaultProcess={stock?.process ?? 'c41'}
            onClose={() => setDevJobDialog(undefined)}
          />
        )}

        <RollFrameGrid roll={roll} />
      </div>
    </div>
  );
}
