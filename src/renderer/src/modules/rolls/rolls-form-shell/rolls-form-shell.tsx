import { Button } from '#/components/ui/button';
import { FieldGroup } from '#/components/ui/field';

type RollsFormShellProps = {
  title: string;
  saveDisabled: boolean;
  saving: boolean;
  /** Set for an existing item; new items cannot be archived. */
  archived?: boolean;
  onSave: () => void;
  onToggleArchive?: () => void;
  children: React.ReactNode;
};

export function RollsFormShell({
  title,
  saveDisabled,
  saving,
  archived,
  onSave,
  onToggleArchive,
  children
}: RollsFormShellProps) {
  return (
    <form
      className="h-full overflow-auto p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!saveDisabled && !saving) {
          onSave();
        }
      }}
    >
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <h2 className="text-sm font-medium">{title}</h2>
        <FieldGroup>{children}</FieldGroup>
        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" disabled={saveDisabled || saving}>
            Save
          </Button>
          {onToggleArchive && (
            <Button type="button" size="sm" variant="outline" onClick={onToggleArchive}>
              {archived ? 'Restore' : 'Archive'}
            </Button>
          )}
        </div>
        {onToggleArchive && (
          <p className="text-xs text-muted-foreground">
            Archived items are hidden from pickers but still show on rolls that use them.
          </p>
        )}
      </div>
    </form>
  );
}
