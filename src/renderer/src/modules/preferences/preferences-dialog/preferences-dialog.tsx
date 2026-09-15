import { useEffect, useState } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '#/components/ui/dialog';
import { getApi } from '#/hooks/use-ipc';
import { PreferencesAppearance } from '#/modules/preferences/preferences-appearance';
import { cn } from '#/utils/common';

const NAV_ITEMS = [{ id: 'appearance', label: 'Appearance' }] as const;

type PreferencesSection = (typeof NAV_ITEMS)[number]['id'];

export default function PreferencesDialog() {
  const [open, setOpen] = useState(false);

  const [section, setSection] = useState<PreferencesSection>('appearance');

  useEffect(() => {
    const unsubscribe = getApi().menu?.onOpenPreferences(() => setOpen(true));
    return unsubscribe;
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex h-[min(32rem,calc(100vh-4rem))] w-full flex-row gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <aside className="flex w-52 shrink-0 flex-col gap-3 border-r border-border bg-muted/40 p-3">
          <nav className="flex flex-col gap-0.5" aria-label="Preferences">
            {NAV_ITEMS.map((item) => {
              const selected = section === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    'h-7 px-2 text-right text-xs font-medium text-muted-foreground transition-colors',
                    'hover:bg-muted hover:text-foreground aria-current:bg-muted aria-current:text-foreground',
                    selected ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  )}
                  aria-current={selected ? 'page' : undefined}
                  onClick={() => setSection(item.id)}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col overflow-auto px-6 py-5">
          <DialogTitle className="text-sm font-medium capitalize">{section}</DialogTitle>
          <DialogDescription className="sr-only">
            Choose how Meta Rolls looks and behaves.
          </DialogDescription>
          {section === 'appearance' ? (
            <section className="mt-6 flex flex-col gap-1">
              <PreferencesAppearance />
            </section>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
