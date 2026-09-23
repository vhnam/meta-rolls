import { useState } from 'react';

import { OptionSelect } from '#/components/option-select';
import { Button } from '#/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '#/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import { FILM_PROCESS_LABEL } from '#/constants/rolls';
import { FILM_PROCESSES, type DevJob, type FilmProcess } from '#/shared/rolls';
import { useRollsStore } from '#/stores/rolls.store';
import { useSettingsStore } from '#/stores/settings.store';

const LAB_LIST_ID = 'dev-job-labs';

type DevJobDialogProps = {
  rollId: string;
  /** The job being edited, or null for a new one. */
  job: DevJob | null;
  defaultProcess: FilmProcess;
  onClose: () => void;
};

/** Mounted only while open, so its fields initialise from props without an effect. */
export function DevJobDialog({ rollId, job, defaultProcess, onClose }: DevJobDialogProps) {
  const rolls = useRollsStore((state) => state.rolls);
  const defaultCurrency = useSettingsStore((state) => state.defaultCurrency);
  const saveDevJob = useRollsStore((state) => state.saveDevJob);
  const labs = [
    ...new Set(rolls.flatMap((roll) => roll.devJobs.map((j) => j.lab)).filter(Boolean))
  ];

  const [lab, setLab] = useState(job?.lab ?? '');
  const [price, setPrice] = useState(job?.price?.toString() ?? '');
  const [currency, setCurrency] = useState(job?.currency ?? defaultCurrency);
  const [sentAt, setSentAt] = useState(job?.sentAt ?? '');
  const [receivedAt, setReceivedAt] = useState(job?.receivedAt ?? '');
  const [process, setProcess] = useState<FilmProcess>(job?.process ?? defaultProcess);
  const [scanResolution, setScanResolution] = useState(job?.scanResolution ?? '');
  const [notes, setNotes] = useState(job?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await saveDevJob({
        id: job?.id,
        rollId,
        lab: lab.trim(),
        price: price.trim() === '' || Number.isNaN(Number(price)) ? null : Number(price),
        currency: currency.trim().toUpperCase() || defaultCurrency,
        sentAt: sentAt || null,
        receivedAt: receivedAt || null,
        process,
        scanResolution: scanResolution.trim(),
        notes
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{job ? 'Edit dev job' : 'Add dev job'}</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="dev-lab">Lab</FieldLabel>
                <Input
                  id="dev-lab"
                  list={LAB_LIST_ID}
                  value={lab}
                  autoComplete="off"
                  onChange={(e) => setLab(e.target.value)}
                />
                <datalist id={LAB_LIST_ID}>
                  {labs.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field>
                  <FieldLabel htmlFor="dev-price">Price</FieldLabel>
                  <Input
                    id="dev-price"
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="dev-currency">Currency</FieldLabel>
                  <Input
                    id="dev-currency"
                    value={currency}
                    maxLength={3}
                    autoComplete="off"
                    onChange={(e) => setCurrency(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="dev-sent">Sent</FieldLabel>
                  <Input
                    id="dev-sent"
                    type="date"
                    value={sentAt}
                    onChange={(e) => setSentAt(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="dev-received">Received</FieldLabel>
                  <Input
                    id="dev-received"
                    type="date"
                    value={receivedAt}
                    onChange={(e) => setReceivedAt(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Process</FieldLabel>
                  <OptionSelect
                    value={process}
                    onChange={(value) => setProcess(value as FilmProcess)}
                    options={FILM_PROCESSES.map((p) => ({
                      value: p,
                      label: FILM_PROCESS_LABEL[p]
                    }))}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="dev-resolution">Scan resolution</FieldLabel>
                  <Input
                    id="dev-resolution"
                    value={scanResolution}
                    placeholder="e.g. 3000×2000"
                    autoComplete="off"
                    onChange={(e) => setScanResolution(e.target.value)}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="dev-notes">Notes</FieldLabel>
                <Input
                  id="dev-notes"
                  value={notes}
                  autoComplete="off"
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {job ? 'Cancel' : 'Skip'}
            </Button>
            <Button type="submit" disabled={saving}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
