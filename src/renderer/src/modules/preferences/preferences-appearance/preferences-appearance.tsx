import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';

import { Card, CardContent } from '#/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '#/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import { LANGUAGE_PREFERENCE, THEME_PREFERENCE } from '#/constants/settings';
import { useSettingsStore } from '#/stores/settings.store';
import { type LanguagePreference, type ThemePreference } from '#/types';

const APPEARANCE_OPTIONS = [
  { value: THEME_PREFERENCE.system, label: 'System', icon: IconDeviceDesktop },
  { value: THEME_PREFERENCE.light, label: 'Light', icon: IconSun },
  { value: THEME_PREFERENCE.dark, label: 'Dark', icon: IconMoon }
] as const;

const LANGUAGE_OPTIONS = [
  { value: LANGUAGE_PREFERENCE.en, label: 'English (US)' },
  { value: LANGUAGE_PREFERENCE.vi, label: 'Tiếng Việt' }
] as const;

export default function PreferencesAppearance() {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-foreground">Theme</span>
            <ToggleGroup
              variant="outline"
              spacing={0}
              value={[theme]}
              onValueChange={(value) => {
                const nextTheme = value[0];
                if (nextTheme) {
                  setTheme(nextTheme as ThemePreference);
                }
              }}
            >
              {APPEARANCE_OPTIONS.map((option) => (
                <Tooltip key={option.value}>
                  <TooltipTrigger
                    render={<ToggleGroupItem value={option.value} aria-label={option.label} />}
                  >
                    <option.icon className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{option.label}</span>
                  </TooltipContent>
                </Tooltip>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-foreground">Language</span>
            <Select
              disabled
              items={LANGUAGE_OPTIONS}
              value={language}
              onValueChange={(value) => {
                if (value) {
                  setLanguage(value as LanguagePreference);
                }
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
