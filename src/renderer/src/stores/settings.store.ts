import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { PRINT_FORMAT, THEME_PREFERENCE } from '#/constants/settings';
import { getApi } from '#/hooks/use-ipc';
import { type PrintFormat, type ThemePreference } from '#/types';

type SettingsState = {
  theme: ThemePreference;
  defaultPrintFormat: PrintFormat;
};

type SettingsActions = {
  setTheme: (theme: ThemePreference) => void;
  setDefaultPrintFormat: (format: PrintFormat) => void;
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
      defaultPrintFormat: PRINT_FORMAT.instaxMini,
      setTheme: (theme) => set({ theme }),
      setDefaultPrintFormat: (defaultPrintFormat) => set({ defaultPrintFormat })
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => ipcSettingsStorage),
      partialize: (state) => ({
        theme: state.theme,
        defaultPrintFormat: state.defaultPrintFormat
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
