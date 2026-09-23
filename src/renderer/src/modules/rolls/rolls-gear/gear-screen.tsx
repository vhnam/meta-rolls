import { IconCamera, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';

import { Button } from '#/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyMedia } from '#/components/ui/empty';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '#/components/ui/resizable';
import { useRollsStore } from '#/stores/rolls.store';
import { cn } from '#/utils/common';

import { cameraLabel } from '../rolls-list/rolls-list-model';
import { CameraForm } from './camera-form';
import { LensForm } from './lens-form';

// `id: null` means a new, unsaved item of that kind.
type Selection = { kind: 'camera' | 'lens'; id: string | null } | null;

type RowProps = {
  label: string;
  archived: boolean;
  selected: boolean;
  onSelect: () => void;
};

function GearRow({ label, archived, selected, onSelect }: RowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left text-xs hover:bg-sidebar-accent',
        selected && 'bg-sidebar-accent',
        archived && 'text-muted-foreground'
      )}
    >
      <span className="truncate">{label}</span>
      {archived && <span className="shrink-0 text-tiny">archived</span>}
    </button>
  );
}

export function GearScreen() {
  const cameras = useRollsStore((state) => state.cameras);
  const lenses = useRollsStore((state) => state.lenses);
  const [selection, setSelection] = useState<Selection>(null);

  const camera =
    selection?.kind === 'camera' ? (cameras.find((c) => c.id === selection.id) ?? null) : null;
  const lens =
    selection?.kind === 'lens' ? (lenses.find((l) => l.id === selection.id) ?? null) : null;

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">
      <ResizablePanel defaultSize="30%" minSize="20%" maxSize="40%">
        <aside className="flex h-full min-h-0 flex-col overflow-auto border-r border-sidebar-border bg-sidebar">
          <div className="flex h-7 shrink-0 items-center justify-between border-b border-border bg-sidebar-accent px-1">
            <div className="px-2 text-tiny font-medium">Cameras</div>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Add camera"
              onClick={() => setSelection({ kind: 'camera', id: null })}
            >
              <IconPlus />
            </Button>
          </div>
          {cameras.map((item) => (
            <GearRow
              key={item.id}
              label={cameraLabel(item)}
              archived={item.archived}
              selected={selection?.kind === 'camera' && selection.id === item.id}
              onSelect={() => setSelection({ kind: 'camera', id: item.id })}
            />
          ))}
          <div className="flex h-7 shrink-0 items-center justify-between border-y border-border bg-sidebar-accent px-1">
            <div className="px-2 text-tiny font-medium">Lenses</div>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Add lens"
              onClick={() => setSelection({ kind: 'lens', id: null })}
            >
              <IconPlus />
            </Button>
          </div>
          {lenses.map((item) => (
            <GearRow
              key={item.id}
              label={item.name}
              archived={item.archived}
              selected={selection?.kind === 'lens' && selection.id === item.id}
              onSelect={() => setSelection({ kind: 'lens', id: item.id })}
            />
          ))}
        </aside>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize="70%" minSize="40%">
        {selection?.kind === 'camera' ? (
          <CameraForm
            key={selection.id ?? 'new-camera'}
            camera={camera}
            onSaved={(id) => setSelection({ kind: 'camera', id })}
          />
        ) : selection?.kind === 'lens' ? (
          <LensForm
            key={selection.id ?? 'new-lens'}
            lens={lens}
            onSaved={(id) => setSelection({ kind: 'lens', id })}
          />
        ) : (
          <Empty className="h-full">
            <EmptyMedia variant="icon">
              <IconCamera />
            </EmptyMedia>
            <EmptyContent>
              <EmptyDescription>
                {cameras.length + lenses.length === 0
                  ? 'No gear yet. Add your first camera or lens'
                  : 'Select a camera or lens to edit it'}
              </EmptyDescription>
            </EmptyContent>
          </Empty>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
