import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type DataSetting = {
  id: string;
  name: string;
  baseType: 'string' | 'number' | 'boolean' | 'date';
  config: Record<string, any>;
};

type DataSettingsState = {
  dataSettings: DataSetting[];
  addDataSetting: (setting: Omit<DataSetting, 'id'>) => void;
  updateDataSetting: (id: string, data: Partial<DataSetting>) => void;
  reset: () => void;
};

export const useDataSettingsStore = create<DataSettingsState>()(
  persist(
    (set) => ({
      dataSettings: [],

      addDataSetting: (setting) =>
        set((state) => ({
          dataSettings: [
            ...state.dataSettings,
            { ...setting, id: crypto.randomUUID() },
          ],
        })),

      updateDataSetting: (id, data) =>
        set((state) => ({
          dataSettings: state.dataSettings.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        })),

      reset: () => set({ dataSettings: [] }),
    }),
    {
      name: 'data-settings-storage', // chave no localStorage
      getStorage: () => localStorage,
    }
  )
);
