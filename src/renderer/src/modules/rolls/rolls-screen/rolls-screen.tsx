import { useEffect, useState } from 'react';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '#/components/ui/resizable';
import { isEditableKeyboardTarget } from '#/utils/common';

import { RollDetail } from '../roll-detail';
import { RollFormDialog } from '../roll-form-dialog';
import { RollsList } from '../rolls-list';

export function RollsScreen() {
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 'n' &&
        !isEditableKeyboardTarget(event.target)
      ) {
        event.preventDefault();
        setDialogOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <ResizablePanelGroup orientation="horizontal" className="h-full">
        <ResizablePanel defaultSize="30%" minSize="20%" maxSize="50%">
          <RollsList onAddRoll={() => setDialogOpen(true)} />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize="70%" minSize="40%">
          <RollDetail />
        </ResizablePanel>
      </ResizablePanelGroup>
      <RollFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
