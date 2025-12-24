import { create } from 'zustand';

interface StoreState {
  userDatabaseSchema: unknown;
  csvFile: File | null;
  csvColumns: string[];
  columnMapping: Record<string, string>;
}

export const useStore = create<StoreState>((set) => ({
  userDatabaseSchema: null,
  csvFile: null,
  //   csvColumns: [],
  csvColumns: ['identificador', 'nname', 'iddade'],
  columnMapping: {},
}));
