import { useState } from 'react';

import { Field, FieldLabel } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import { type Lens } from '#/shared/rolls';
import { useRollsStore } from '#/stores/rolls.store';

import { RollsFormShell } from '../rolls-form-shell';

type LensFormProps = {
  lens: Lens | null;
  onSaved: (id: string) => void;
};

/** Keyed by lens id by its parent, so state initialises from props without an effect. */
export function LensForm({ lens, onSaved }: LensFormProps) {
  const saveGear = useRollsStore((state) => state.saveGear);
  const archiveGear = useRollsStore((state) => state.archiveGear);
  const [name, setName] = useState(lens?.name ?? '');
  const [focalLength, setFocalLength] = useState(lens?.focalLength ?? '');
  const [maxAperture, setMaxAperture] = useState(lens?.maxAperture ?? '');
  const [mount, setMount] = useState(lens?.mount ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      onSaved(
        await saveGear({
          kind: 'lens',
          value: {
            id: lens?.id,
            name: name.trim(),
            focalLength: focalLength.trim(),
            maxAperture: maxAperture.trim(),
            mount: mount.trim()
          }
        })
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <RollsFormShell
      title={lens ? 'Edit lens' : 'Add lens'}
      saveDisabled={!name.trim()}
      saving={saving}
      archived={lens?.archived}
      onSave={() => void save()}
      onToggleArchive={lens ? () => void archiveGear('lens', lens.id, !lens.archived) : undefined}
    >
      <Field>
        <FieldLabel htmlFor="lens-name">Name</FieldLabel>
        <Input
          id="lens-name"
          value={name}
          placeholder="Nikkor 50mm f/1.8"
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="lens-focal">Focal length</FieldLabel>
        <Input
          id="lens-focal"
          value={focalLength}
          placeholder="50mm"
          onChange={(e) => setFocalLength(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="lens-aperture">Max aperture</FieldLabel>
        <Input
          id="lens-aperture"
          value={maxAperture}
          placeholder="f/1.8"
          onChange={(e) => setMaxAperture(e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="lens-mount">Mount</FieldLabel>
        <Input
          id="lens-mount"
          value={mount}
          placeholder="F"
          onChange={(e) => setMount(e.target.value)}
        />
      </Field>
    </RollsFormShell>
  );
}
