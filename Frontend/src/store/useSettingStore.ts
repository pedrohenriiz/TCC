import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SettingColumn = {
  id: string;
  column: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean';
  active: boolean;
};

type SettingState = {
  columns: SettingColumn[];
  editing: SettingColumn | undefined;
  addColumn: (column: Omit<SettingColumn, 'id'>) => void;
  updateColumn: (id: string, data: Partial<SettingColumn>) => void;
  setEditing: (id?: string) => void;
  removeEditing: () => void;
  removeColumn: (id: string) => void;
  reset: () => void;
};

export const useSettingStore = create<SettingState>()(
  persist(
    (set) => ({
      columns: [
        {
          id: '1',
          column: 'company_id',
          value: 123,
          type: 'número',
          active: true,
        },
      ],
      editing: undefined,
      addColumn: (column) =>
        set((state) => ({
          columns: [...state.columns, { ...column, id: crypto.randomUUID() }],
        })),
      updateColumn: (id, data) =>
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === id ? { ...col, ...data } : col
          ),
        })),

      removeColumn: (id) =>
        set((state) => ({
          columns: state.columns.filter((col) => col.id !== id),
        })),
      setEditing: (id) =>
        set((state) => ({
          editing: state.columns.find((column) => column.id === id),
        })),
      removeEditing: () =>
        set(() => ({
          editing: undefined,
        })),
      reset: () => set({ columns: [] }),
    }),
    {
      name: 'settings-storage', // nome da chave no localStorage
      getStorage: () => localStorage, // define onde salvar
    }
  )
);
