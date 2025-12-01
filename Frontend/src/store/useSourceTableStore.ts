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
  addSourceTableFromExcel: (
    projectId: number,
    fileName: string,
    data: any[],
    columns: any[],
    rowCount: number
  ) => SourceTable;
  addManualSourceTable: (name: string, columns: any[]) => SourceTable;
  updateSourceTable: (id: number, updates: Partial<SourceTable>) => void;
  deleteSourceTable: (id: number) => void;

  getSourceTableById: (id: number) => SourceTable | undefined;
  getSourceTablesByProject: () => SourceTable[];
  setCurrentSourceTable: (table: SourceTable | null) => void;
  clearCurrentSourceTable: () => void;
  clearAllSourceTables: () => void;
  searchSourceTables: (searchTerm: string, projectId?: number) => SourceTable[];
  tableNameExists: (
    name: string,
    projectId: number,
    excludeId?: number | null
  ) => boolean;
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

      // Adicionar tabela de origem a partir do Excel
      addSourceTableFromExcel: (
        projectId,
        fileName,
        data,
        columns,
        rowCount
      ) => {
        const newTable: SourceTable = {
          id: Date.now(),
          projectId,
          name: fileName.replace(/\.[^/.]+$/, ''),
          source: 'excel',
          fileName: fileName,
          columns: columns,
          rowCount: rowCount,
          data: data,
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

      getSourceTableById: (id) => {
        return get().sourceTables.find((table) => table.id === id);
      },

      getSourceTablesByProject: () => {
        return get().sourceTables;
      },

      setCurrentSourceTable: (table) => {
        set({ currentSourceTable: table });
      },

      setSourceTableList: (table) => {
        set({ sourceTables: table });
      },

      clearCurrentSourceTable: () => {
        set({ currentSourceTable: null });
      },

      clearAllSourceTables: () => {
        set({ sourceTables: [], currentSourceTable: null });
      },

      searchSourceTables: (searchTerm, projectId) => {
        let tables = get().sourceTables;

        if (projectId) {
          tables = tables.filter((table) => table.projectId === projectId);
        }

        if (!searchTerm) return tables;

        return tables.filter((table) =>
          table.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
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
