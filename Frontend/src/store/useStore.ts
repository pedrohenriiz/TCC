import { create } from 'zustand';

interface StoreState {
  userDatabaseSchema: unknown;
  csvFile: File | null;
  csvColumns: string[];
  columnMapping: Record<string, string>;
  setColumnMapping: (mapping: Record<string, string>) => void;
  setUserDatabaseSchema: (schema: unknown) => void;
  setCsvColumns: (columns: string[]) => void;
  setCsvFile: (file: File) => void;
  resetStore: () => void;
}

export const useStore = create<StoreState>((set) => ({
  userDatabaseSchema: null,
  csvFile: null,
  //   csvColumns: [],
  csvColumns: ['identificador', 'nname', 'iddade'],
  columnMapping: {},
  setColumnMapping: (mapping) => set({ columnMapping: mapping }),
  setUserDatabaseSchema: (schema) => set({ userDatabaseSchema: schema }),
  setCsvColumns: (columns) => set({ csvColumns: columns }),
  setCsvFile: (file) => set({ csvFile: file }),
  resetStore: () =>
    set({
      userDatabaseSchema: null,
      csvColumns: [],
      csvFile: null,
      columnMapping: {},
    }),
}));
