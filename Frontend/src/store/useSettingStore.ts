// store/useSettingStore.ts

import { create } from 'zustand';

type MigrationSettings = {
  allow_duplicates: string;
  duplicate_strategy: string;
};

type SettingState = {
  migrationSettings: MigrationSettings;
  isLoading: boolean;
  error: string | null;

  // Actions
  setMigrationSettings: (settings: MigrationSettings) => void;
  updateMigrationSetting: (key: keyof MigrationSettings, value: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

const initialState = {
  migrationSettings: {
    allow_duplicates: 'false',
    duplicate_strategy: 'first',
  },
  isLoading: false,
  error: null,
};

export const useSettingStore = create<SettingState>((set) => ({
  ...initialState,

  setMigrationSettings: (settings) => set({ migrationSettings: settings }),

  updateMigrationSetting: (key, value) =>
    set((state) => ({
      migrationSettings: {
        ...state.migrationSettings,
        [key]: value,
      },
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
