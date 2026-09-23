import { useState } from 'react';

import { Field, FieldLabel } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import { FILM_FORMAT_LABEL } from '#/constants/rolls';
import { FILM_FORMATS, type Camera, type FilmFormat } from '#/shared/rolls';
import { useRollsStore } from '#/stores/rolls.store';

import { RollsFormShell } from '../rolls-form-shell';
import { RollsOptionSelect } from '../rolls-option-select';

type CameraFormProps = {
  camera: Camera | null;
  onSaved: (id: string) => void;
};

/** Keyed by camera id by its parent, so state initialises from props without an effect. */
export function CameraForm({ camera, onSaved }: CameraFormProps) {
  const saveGear = useRollsStore((state) => state.saveGear);
  const archiveGear = useRollsStore((state) => state.archiveGear);
  const [brand, setBrand] = useState(camera?.brand ?? '');
  const [model, setModel] = useState(camera?.model ?? '');
  const [format, setFormat] = useState<FilmFormat>(camera?.format ?? '135');
  const [notes, setNotes] = useState(camera?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      onSaved(
        await saveGear({
          kind: 'camera',
          value: { id: camera?.id, brand: brand.trim(), model: model.trim(), format, notes }
        })
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <RollsFormShell
      title={camera ? 'Edit camera' : 'Add camera'}
      saveDisabled={!brand.trim() && !model.trim()}
      saving={saving}
      archived={camera?.archived}
      onSave={() => void save()}
      onToggleArchive={
        camera ? () => void archiveGear('camera', camera.id, !camera.archived) : undefined
      }
    >
      <Field>
        <FieldLabel htmlFor="camera-brand">Brand</FieldLabel>
        <Input
          id="camera-brand"
          value={brand}
          placeholder="Nikon"
          onChange={(e) => setBrand(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="camera-model">Model</FieldLabel>
        <Input
          id="camera-model"
          value={model}
          placeholder="FM2"
          onChange={(e) => setModel(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel>Format</FieldLabel>
        <RollsOptionSelect
          value={format}
          onChange={(value) => setFormat(value as FilmFormat)}
          options={FILM_FORMATS.map((f) => ({ value: f, label: FILM_FORMAT_LABEL[f] }))}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="camera-notes">Notes</FieldLabel>
        <Input id="camera-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
    </RollsFormShell>
  );
}
