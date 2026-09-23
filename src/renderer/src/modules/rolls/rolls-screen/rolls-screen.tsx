import { useEffect, useState } from 'react';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '#/components/ui/resizable';
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs';
import { isEditableKeyboardTarget } from '#/utils/common';

import { RollDetail } from '../roll-detail';
import { RollFormDialog } from '../roll-form-dialog';
import { FrameInspector } from '../roll-frames';
import { GearScreen } from '../rolls-gear';
import { RollsList } from '../rolls-list';
import { StocksScreen } from '../rolls-stocks';

const SECTIONS = [
  { value: 'rolls', label: 'Rolls' },
  { value: 'gear', label: 'Gear' },
  { value: 'stocks', label: 'Stocks' }
] as const;

type Section = (typeof SECTIONS)[number]['value'];

function RollsSection() {
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
        <ResizablePanel defaultSize="30%" minSize="20%" maxSize="40%">
          <RollsList onAddRoll={() => setDialogOpen(true)} />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize="45%" minSize="30%">
          <RollDetail />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize="25%" minSize="15%" maxSize="40%">
          <FrameInspector />
        </ResizablePanel>
      </ResizablePanelGroup>
      <RollFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}

export function RollsScreen() {
  const [section, setSection] = useState<Section>('rolls');

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-8 shrink-0 items-center border-b border-border bg-sidebar-accent px-2">
        <Tabs value={section} onValueChange={(next) => setSection(next as Section)}>
          <TabsList variant="line">
            {SECTIONS.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="min-h-0 flex-1">
        {section === 'rolls' ? (
          <RollsSection />
        ) : section === 'gear' ? (
          <GearScreen />
        ) : (
          <StocksScreen />
        )}
      </div>
    </div>
  );
}
