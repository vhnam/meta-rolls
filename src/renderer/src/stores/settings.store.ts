import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { LANGUAGE_PREFERENCE, PRINT_FORMAT, THEME_PREFERENCE } from '#/constants/settings';
import { getApi } from '#/hooks/use-ipc';
import { DEFAULT_CURRENCY } from '#/shared/rolls';
import { type LanguagePreference, type PrintFormat, type ThemePreference } from '#/types';

type SettingsState = {
  theme: ThemePreference;
  language: LanguagePreference;
  defaultPrintFormat: PrintFormat;
  /** Digital-only users can hide the Rolls workspace. */
  rollsEnabled: boolean;
  /** Currency a new dev job starts with (ISO 4217 code). */
  defaultCurrency: string;
};

type SettingsActions = {
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: LanguagePreference) => void;
  setDefaultPrintFormat: (format: PrintFormat) => void;
  setRollsEnabled: (enabled: boolean) => void;
  setDefaultCurrency: (currency: string) => void;
};

export type SettingsStore = SettingsState & SettingsActions;

const ipcSettingsStorage: StateStorage = {
  getItem: (name) => getApi().settings.getItem(name),
  setItem: (name, value) => getApi().settings.setItem(name, value),
  removeItem: (name) => getApi().settings.removeItem(name)
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: THEME_PREFERENCE.system,
      language: LANGUAGE_PREFERENCE.en,
      defaultPrintFormat: PRINT_FORMAT.instaxMini,
      rollsEnabled: true,
      defaultCurrency: DEFAULT_CURRENCY,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setDefaultPrintFormat: (defaultPrintFormat) => set({ defaultPrintFormat }),
      setRollsEnabled: (rollsEnabled) => set({ rollsEnabled }),
      setDefaultCurrency: (currency) =>
        set({ defaultCurrency: currency.trim().toUpperCase().slice(0, 3) || DEFAULT_CURRENCY })
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => ipcSettingsStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        defaultPrintFormat: state.defaultPrintFormat,
        rollsEnabled: state.rollsEnabled,
        defaultCurrency: state.defaultCurrency
      }),
      skipHydration: true
    }
  )
);

export const hydrateSettingsStore = async () => {
  try {
    await useSettingsStore.persist.rehydrate();
  } catch (error) {
    console.error('Failed to load settings from main process', error);
  }
};
