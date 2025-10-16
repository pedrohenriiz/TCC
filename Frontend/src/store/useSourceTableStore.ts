// store/useSourceTablesStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSourceTablesStore = create(
  persist(
    (set, get) => ({
      // Estado inicial
      sourceTables: [],
      currentSourceTable: null,

      // Adicionar tabela de origem
      addSourceTable: (table) => {
        const newTable = {
          id: Date.now(),
          ...table,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          sourceTables: [...state.sourceTables, newTable],
        }));

        return newTable;
      },

      // Adicionar tabela de origem a partir do Excel
      addSourceTableFromExcel: (fileName, data, columns, rowCount) => {
        const newTable = {
          id: Date.now(),
          name: fileName.replace(/\.[^/.]+$/, ''), // Remove extensão
          source: 'excel',
          fileName: fileName,
          columns: columns,
          rowCount: rowCount,
          data: data, // Dados completos do Excel
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          sourceTables: [...state.sourceTables, newTable],
        }));

        return newTable;
      },

      // Adicionar tabela manual
      addManualSourceTable: (name, columns) => {
        const newTable = {
          id: Date.now(),
          name: name,
          source: 'manual',
          fileName: null,
          columns: columns,
          rowCount: 0,
          data: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          sourceTables: [...state.sourceTables, newTable],
        }));

        return newTable;
      },

      // Atualizar tabela de origem
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

      // Deletar tabela de origem
      deleteSourceTable: (id) => {
        set((state) => ({
          sourceTables: state.sourceTables.filter((table) => table.id !== id),
          currentSourceTable:
            state.currentSourceTable?.id === id
              ? null
              : state.currentSourceTable,
        }));
      },

      // Buscar tabela por ID
      getSourceTableById: (id) => {
        return get().sourceTables.find((table) => table.id === id);
      },

      // Definir tabela atual
      setCurrentSourceTable: (table) => {
        set({ currentSourceTable: table });
      },

      // Limpar tabela atual
      clearCurrentSourceTable: () => {
        set({ currentSourceTable: null });
      },

      // Limpar todas as tabelas
      clearAllSourceTables: () => {
        set({ sourceTables: [], currentSourceTable: null });
      },

      // Buscar por nome
      searchSourceTables: (searchTerm) => {
        const tables = get().sourceTables;
        if (!searchTerm) return tables;

        return tables.filter((table) =>
          table.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      },

      // Verificar se existe tabela com mesmo nome
      tableNameExists: (name, excludeId = null) => {
        return get().sourceTables.some(
          (table) =>
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
