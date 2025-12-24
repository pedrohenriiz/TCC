// store/useSourceTablesStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SourceTable {
  id: number;
  name: string;
  source: 'excel' | 'manual';
  fileName: string | null;
  columns: any[];
  rowCount: number;
  data: any[] | null;
  createdAt: string;
  updatedAt: string;
}

interface SourceTablesStore {
  sourceTables: SourceTable[];
  currentSourceTable: SourceTable | null;

  addSourceTable: (
    projectId: number,
    table: Partial<SourceTable>
  ) => SourceTable;
  updateSourceTable: (id: number, updates: Partial<SourceTable>) => void;
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          sourceTables: [...state.sourceTables, newTable],
        }));

        return newTable;
      },

      addManualSourceTable: (name, columns) => {
        const newTable: SourceTable = {
          name: name,
          columns: columns,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
            table.projectId === projectId &&
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
