import { useLayoutEffect } from 'react';

import { THEME_PREFERENCE } from '#/constants/settings';
import { useSettingsStore } from '#/stores/settings.store';
import { type ThemePreference } from '#/types';

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

const resolveTheme = (theme: ThemePreference): 'light' | 'dark' => {
  if (theme === THEME_PREFERENCE.system) {
    return window.matchMedia(SYSTEM_DARK_QUERY).matches
      ? THEME_PREFERENCE.dark
      : THEME_PREFERENCE.light;
  }

  return theme;
};

export const applyDocumentTheme = (theme: ThemePreference): void => {
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle('dark', resolved === THEME_PREFERENCE.dark);
  document.documentElement.style.colorScheme = resolved;
};

export const useThemeSync = (): void => {
  const theme = useSettingsStore((state) => state.theme);

  useLayoutEffect(() => {
    applyDocumentTheme(theme);

    if (theme !== THEME_PREFERENCE.system) {
      return;
    }

    const media = window.matchMedia(SYSTEM_DARK_QUERY);
    const handleChange = () => applyDocumentTheme(THEME_PREFERENCE.system);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [theme]);
};
