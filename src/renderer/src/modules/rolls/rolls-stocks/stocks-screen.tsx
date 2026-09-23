import { IconMovie, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';

import { Button } from '#/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyMedia } from '#/components/ui/empty';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '#/components/ui/resizable';
import { FILM_FORMAT_LABEL } from '#/constants/rolls';
import { useRollsStore } from '#/stores/rolls.store';
import { cn } from '#/utils/common';

import { stockLabel } from '../rolls-list/rolls-list-model';
import { StockForm } from './stock-form';

// `null` = nothing selected, `'new'` = an unsaved stock.
export function StocksScreen() {
  const stocks = useRollsStore((state) => state.stocks);
  const [selectedId, setSelectedId] = useState<string | 'new' | null>(null);
  const stock = stocks.find((s) => s.id === selectedId) ?? null;

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">
      <ResizablePanel defaultSize="30%" minSize="20%" maxSize="40%">
        <aside className="flex h-full min-h-0 flex-col overflow-auto border-r border-sidebar-border bg-sidebar">
          <div className="flex h-7 shrink-0 items-center justify-between border-b border-border bg-sidebar-accent px-1">
            <div className="px-2 text-tiny font-medium">Film stocks</div>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Add film stock"
              onClick={() => setSelectedId('new')}
            >
              <IconPlus />
            </Button>
          </div>
          {stocks.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={cn(
                'flex w-full flex-col gap-0.5 px-2 py-1.5 text-left text-xs hover:bg-sidebar-accent',
                selectedId === item.id && 'bg-sidebar-accent',
                item.archived && 'text-muted-foreground'
              )}
            >
              <span className="truncate">
                {stockLabel(item)}
                {item.archived && ' (archived)'}
              </span>
              <span className="text-muted-foreground">
                ISO {item.iso} · {FILM_FORMAT_LABEL[item.format]} · {item.exposures} exp
              </span>
            </button>
          ))}
        </aside>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize="70%" minSize="40%">
        {selectedId !== null && (selectedId === 'new' || stock) ? (
          <StockForm
            key={selectedId}
            stock={selectedId === 'new' ? null : stock}
            onSaved={setSelectedId}
          />
        ) : (
          <Empty className="h-full">
            <EmptyMedia variant="icon">
              <IconMovie />
            </EmptyMedia>
            <EmptyContent>
              <EmptyDescription>
                {stocks.length === 0
                  ? 'No film stocks yet. Add your first stock'
                  : 'Select a film stock to edit it'}
              </EmptyDescription>
            </EmptyContent>
          </Empty>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
