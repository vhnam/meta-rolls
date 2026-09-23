import { OptionSelect } from '#/components/option-select';
import { Empty, EmptyContent, EmptyDescription } from '#/components/ui/empty';
import { Field, FieldLabel } from '#/components/ui/field';
import { Switch } from '#/components/ui/switch';
import { type RollFrame } from '#/shared/rolls';
import { useRollsStore } from '#/stores/rolls.store';

import { RollsField } from '../rolls-field';

const NONE = 'none';

/** The value all frames share, or null when they differ (shown as "Mixed"). */
const shared = <K extends keyof RollFrame>(frames: RollFrame[], key: K): RollFrame[K] | null =>
  frames.every((frame) => frame[key] === frames[0][key]) ? frames[0][key] : null;

export function FrameInspector() {
  const roll = useRollsStore((state) => state.rolls.find((r) => r.id === state.selectedRollId));
  const selectedFrameIds = useRollsStore((state) => state.selectedFrameIds);
  const lenses = useRollsStore((state) => state.lenses);
  const updateFrames = useRollsStore((state) => state.updateFrames);

  const frames = roll?.frames.filter((frame) => selectedFrameIds.includes(frame.id)) ?? [];
  if (frames.length === 0) {
    return (
      <Empty className="h-full">
        <EmptyContent>
          <EmptyDescription>Select frames to edit their details</EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  const ids = frames.map((frame) => frame.id);
  const text = (key: 'aperture' | 'shutter' | 'location' | 'notes') => shared(frames, key) ?? '';
  const mixed = frames.length > 1 ? 'Mixed' : undefined;
  const lensId = shared(frames, 'lensId');
  const lensMixed = new Set(frames.map((frame) => frame.lensId)).size > 1;
  const blank = shared(frames, 'blank');
  const shotAt = shared(frames, 'shotAt');

  return (
    <div className="h-full overflow-auto p-3">
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-medium">
          {frames.length === 1 ? `Frame ${frames[0].number}` : `${frames.length} frames`}
        </h3>
        <RollsField
          label="Aperture"
          value={text('aperture')}
          placeholder={mixed ?? 'f/2.8'}
          onCommit={(aperture) => void updateFrames(ids, { aperture: aperture.trim() })}
        />
        <RollsField
          label="Shutter speed"
          value={text('shutter')}
          placeholder={mixed ?? '1/125'}
          onCommit={(shutter) => void updateFrames(ids, { shutter: shutter.trim() })}
        />
        <Field>
          <FieldLabel>Lens</FieldLabel>
          <OptionSelect
            // A mixed selection has no single value; an empty value shows the placeholder.
            value={lensMixed ? '' : (lensId ?? NONE)}
            placeholder="Mixed"
            onChange={(id) => void updateFrames(ids, { lensId: id === NONE ? null : id })}
            options={[
              { value: NONE, label: 'Roll default' },
              ...lenses
                .filter((lens) => !lens.archived || lens.id === lensId)
                .map((lens) => ({ value: lens.id, label: lens.name }))
            ]}
          />
        </Field>
        <RollsField
          label="Date"
          type="date"
          value={shotAt ?? ''}
          onCommit={(value) => void updateFrames(ids, { shotAt: value || null })}
        />
        <RollsField
          label="Location"
          value={text('location')}
          placeholder={mixed}
          onCommit={(location) => void updateFrames(ids, { location: location.trim() })}
        />
        <RollsField
          label="Notes"
          value={text('notes')}
          placeholder={mixed}
          onCommit={(notes) => void updateFrames(ids, { notes })}
        />
        <Field orientation="horizontal">
          <Switch
            size="sm"
            checked={blank === true}
            onCheckedChange={(checked) => void updateFrames(ids, { blank: checked })}
          />
          <FieldLabel>
            {blank === null ? 'Unexposed / blank (mixed)' : 'Unexposed / blank'}
          </FieldLabel>
        </Field>
      </div>
    </div>
  );
}
