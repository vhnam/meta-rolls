import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';

import { Card, CardContent } from '#/components/ui/card';
import { Input } from '#/components/ui/input';
import { Switch } from '#/components/ui/switch';
import { useSettingsStore } from '#/stores/settings.store';

export default function PreferencesRolls() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const rollsEnabled = useSettingsStore((state) => state.rollsEnabled);
  const setRollsEnabled = useSettingsStore((state) => state.setRollsEnabled);
  const defaultCurrency = useSettingsStore((state) => state.defaultCurrency);
  const setDefaultCurrency = useSettingsStore((state) => state.setDefaultCurrency);
  const [currencyDraft, setCurrencyDraft] = useState(defaultCurrency);

  const handleEnabledChange = (enabled: boolean) => {
    setRollsEnabled(enabled);
    // Hiding the workspace while it is open would strand the user on a hidden page.
    if (!enabled && pathname.startsWith('/rolls')) {
      void navigate({ to: '/media' });
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">Show Rolls workspace</span>
              <span className="text-xs text-muted-foreground">
                Turn off if you only shoot digital. Your rolls are kept.
              </span>
            </div>
            <Switch
              aria-label="Show Rolls workspace"
              checked={rollsEnabled}
              onCheckedChange={handleEnabledChange}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">Default currency</span>
              <span className="text-xs text-muted-foreground">
                Used when adding a dev job (3-letter code, e.g. VND, USD).
              </span>
            </div>
            <Input
              aria-label="Default currency"
              className="w-20"
              value={currencyDraft}
              maxLength={3}
              autoComplete="off"
              onChange={(event) => setCurrencyDraft(event.target.value)}
              onBlur={() => {
                setDefaultCurrency(currencyDraft);
                setCurrencyDraft(useSettingsStore.getState().defaultCurrency);
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
