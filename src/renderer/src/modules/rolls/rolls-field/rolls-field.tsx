import { Field, FieldLabel } from '#/components/ui/field';
import { Input } from '#/components/ui/input';

type RollsFieldProps = {
  label: string;
  value: string;
  type?: 'text' | 'number' | 'date';
  placeholder?: string;
  onCommit: (value: string) => void;
};

/**
 * Text-like input that saves on blur or Enter, so typing never round-trips through IPC.
 * Uncontrolled and keyed by the saved value: when a save reloads the roll, the input remounts
 * with the new value instead of syncing state in an effect.
 */
export function RollsField({
  label,
  value,
  type = 'text',
  placeholder,
  onCommit
}: RollsFieldProps) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Input
        key={value}
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        autoComplete="off"
        onBlur={(e) => e.target.value !== value && onCommit(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
    </Field>
  );
}
