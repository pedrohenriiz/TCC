// store/tableConfigStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useTableConfigStore = create(
  persist(
    (set, get) => ({
      // Estado inicial
      tableConfigs: [],
      currentConfig: null,

      // Adicionar nova configuração
      addTableConfig: (config) => {
        const newConfig = {
          id: Date.now(), // ID único baseado em timestamp
          ...config,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set((state) => ({
          tableConfigs: [...state.tableConfigs, newConfig],
        }));

        return newConfig;
      },

      // Atualizar configuração existente
      updateTableConfig: (id, updates) => {
        set((state) => ({
          tableConfigs: state.tableConfigs.map((config) =>
            config.id === id
              ? {
                  ...config,
                  ...updates,
                  updated_at: new Date().toISOString(),
                }
              : config
          ),
        }));
      },

      // Deletar configuração
      deleteTableConfig: (id) => {
        set((state) => ({
          tableConfigs: state.tableConfigs.filter((config) => config.id !== id),
          currentConfig:
            state.currentConfig?.id === id ? null : state.currentConfig,
        }));
      },

      // Buscar configuração por ID
      getTableConfigById: (id) => {
        return get().tableConfigs.find((config) => config.id === id);
      },

      // Definir configuração atual
      setCurrentConfig: (config) => {
        set({ currentConfig: config });
      },

      // Limpar configuração atual
      clearCurrentConfig: () => {
        set({ currentConfig: null });
      },

      // Limpar todas as configurações (útil para testes)
      clearAllConfigs: () => {
        set({ tableConfigs: [], currentConfig: null });
      },

      // Buscar configurações por nome
      searchTableConfigs: (searchTerm) => {
        const configs = get().tableConfigs;
        if (!searchTerm) return configs;

        return configs.filter(
          (config) =>
            config.table_name
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            config.display_name
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
      },
    }),
    {
      name: 'table-config-storage', // Nome da chave no localStorage
      partialize: (state) => ({
        tableConfigs: state.tableConfigs,
      }), // Salvar apenas tableConfigs no localStorage
    }
  )
);

export default useTableConfigStore;
