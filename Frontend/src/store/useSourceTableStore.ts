// store/useSourceTablesStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SourceTableColumnProps {
  id?: number;
  name: string;
  type: string;
  is_pk: boolean;
  is_natural_key: boolean;
  origin_table_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface SourceTable {
  id: number;
  name: string;
  migration_project_id: number;
  columns: SourceTableColumnProps[];
  created_at?: string;
  updated_at?: string;
}

interface SourceTablesStore {
  sourceTables: SourceTable[];
  currentSourceTable: SourceTable | null;

  addSourceTable: (projectId: number, table: SourceTable) => SourceTable;
  updateSourceTable: (id: number, updates: SourceTable) => void;
  deleteSourceTable: (id: number) => void;

  getSourceTablesByProject: () => SourceTable[];
  clearAllSourceTables: () => void;
  tableNameExists: (
    name: string,
    projectId: number,
    excludeId?: number | null
  ) => boolean;
  setSourceTableList: (table: SourceTable[]) => void;
}

const useSourceTablesStore = create<SourceTablesStore>()(
  persist(
    (set, get) => ({
      sourceTables: [],
      currentSourceTable: null,

      addSourceTable: (projectId, table) => {
        const newTable: SourceTable = {
          id: table.id,
          name: table.name || '',
          columns: table.columns || [],
          migration_project_id: projectId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set((state) => ({
          sourceTables: [...state.sourceTables, newTable],
        }));

        return newTable;
      },

      updateSourceTable: (id, updates) => {
        set((state) => ({
          sourceTables: state.sourceTables.map((table) =>
            table.id === id
              ? {
                  ...table,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : table
          ),
        }));
      },

      deleteSourceTable: (id) => {
        set((state) => ({
          sourceTables: state.sourceTables.filter((table) => table.id !== id),
          currentSourceTable:
            state.currentSourceTable?.id === id
              ? null
              : state.currentSourceTable,
        }));
      },

      getSourceTablesByProject: () => {
        return get().sourceTables;
      },

      setSourceTableList: (table) => {
        set({ sourceTables: table });
      },

      clearAllSourceTables: () => {
        set({ sourceTables: [], currentSourceTable: null });
      },

      tableNameExists: (name, projectId, excludeId = null) => {
        return get().sourceTables.some(
          (table) =>
            table.id === projectId &&
            table.name.toLowerCase() === name.toLowerCase() &&
            table.id !== excludeId
        );
      },
    }),
    {
      name: 'source-tables-storage',
      partialize: (state) => ({
        sourceTables: state.sourceTables,
      }),
    }
  )
);

export default useSourceTablesStore;
