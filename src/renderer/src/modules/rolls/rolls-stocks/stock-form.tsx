import { useState } from 'react';

import { OptionSelect } from '#/components/option-select';
import { Field, FieldLabel } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import { FILM_FORMAT_LABEL, FILM_PROCESS_LABEL, FILM_TYPE_LABEL } from '#/constants/rolls';
import {
  FILM_FORMATS,
  FILM_PROCESSES,
  FILM_TYPES,
  type FilmFormat,
  type FilmProcess,
  type FilmStock,
  type FilmType
} from '#/shared/rolls';
import { useRollsStore } from '#/stores/rolls.store';

import { RollsFormShell } from '../rolls-form-shell';

type StockFormProps = {
  stock: FilmStock | null;
  onSaved: (id: string) => void;
};

/** Keyed by stock id by its parent, so state initialises from props without an effect. */
export function StockForm({ stock, onSaved }: StockFormProps) {
  const saveGear = useRollsStore((state) => state.saveGear);
  const archiveGear = useRollsStore((state) => state.archiveGear);
  const [brand, setBrand] = useState(stock?.brand ?? '');
  const [name, setName] = useState(stock?.name ?? '');
  const [iso, setIso] = useState(String(stock?.iso ?? 400));
  const [exposures, setExposures] = useState(String(stock?.exposures ?? 36));
  const [format, setFormat] = useState<FilmFormat>(stock?.format ?? '135');
  const [process, setProcess] = useState<FilmProcess>(stock?.process ?? 'c41');
  const [type, setType] = useState<FilmType>(stock?.type ?? 'color-negative');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      onSaved(
        await saveGear({
          kind: 'stock',
          value: {
            id: stock?.id,
            brand: brand.trim(),
            name: name.trim(),
            iso: Number(iso) > 0 ? Number(iso) : 400,
            exposures: Number(exposures) > 0 ? Math.floor(Number(exposures)) : 36,
            format,
            process,
            type
          }
        })
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <RollsFormShell
      title={stock ? 'Edit film stock' : 'Add film stock'}
      saveDisabled={!brand.trim() && !name.trim()}
      saving={saving}
      archived={stock?.archived}
      onSave={() => void save()}
      onToggleArchive={
        stock ? () => void archiveGear('stock', stock.id, !stock.archived) : undefined
      }
    >
      <Field>
        <FieldLabel htmlFor="stock-brand">Brand</FieldLabel>
        <Input
          id="stock-brand"
          value={brand}
          placeholder="Kodak"
          onChange={(e) => setBrand(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="stock-name">Name</FieldLabel>
        <Input
          id="stock-name"
          value={name}
          placeholder="Portra 400"
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field>
          <FieldLabel htmlFor="stock-iso">ISO</FieldLabel>
          <Input
            id="stock-iso"
            type="number"
            min={1}
            value={iso}
            onChange={(e) => setIso(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="stock-exposures">Exposures</FieldLabel>
          <Input
            id="stock-exposures"
            type="number"
            min={1}
            value={exposures}
            onChange={(e) => setExposures(e.target.value)}
          />
        </Field>
      </div>
      <Field>
        <FieldLabel>Format</FieldLabel>
        <OptionSelect
          value={format}
          onChange={(value) => setFormat(value as FilmFormat)}
          options={FILM_FORMATS.map((f) => ({ value: f, label: FILM_FORMAT_LABEL[f] }))}
        />
      </Field>
      <Field>
        <FieldLabel>Process</FieldLabel>
        <OptionSelect
          value={process}
          onChange={(value) => setProcess(value as FilmProcess)}
          options={FILM_PROCESSES.map((p) => ({ value: p, label: FILM_PROCESS_LABEL[p] }))}
        />
      </Field>
      <Field>
        <FieldLabel>Type</FieldLabel>
        <OptionSelect
          value={type}
          onChange={(value) => setType(value as FilmType)}
          options={FILM_TYPES.map((t) => ({ value: t, label: FILM_TYPE_LABEL[t] }))}
        />
      </Field>
    </RollsFormShell>
  );
}
