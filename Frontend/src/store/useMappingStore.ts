// store/useMappingStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ColumnMapping {
  id: string;
  sourceTableId: number;
  sourceTableName: string;
  sourceColumnId: number;
  sourceColumnName: string;
  destTableId: number;
  destTableName: string;
  destColumnId: number;
  destColumnName: string;
}

export interface Mapping {
  id: number;
  projectId: number;
  name: string;
  columnMappings: ColumnMapping[];
  status: 'complete' | 'incomplete';
  createdAt: string;
  updatedAt: string;
}

interface MappingStore {
  mappings: Mapping[];

  // CRUD Operations
  addMapping: (
    projectId: number,
    name: string,
    columnMappings: ColumnMapping[]
  ) => Mapping;

  updateMapping: (id: number, updates: Partial<Mapping>) => void;

  deleteMapping: (id: number) => void;

  // Queries
  getMappingById: (id: number) => Mapping | undefined;

  getMappingsByProject: (projectId: number) => Mapping[];

  searchMappings: (searchTerm: string, projectId?: number) => Mapping[];

  // Validations
  mappingNameExists: (
    name: string,
    projectId: number,
    excludeId?: number | null
  ) => boolean;

  // Statistics
  getMappingStats: (projectId: number) => {
    total: number;
    complete: number;
    incomplete: number;
  };

  // Utility
  clearAllMappings: () => void;
  clearMappingsByProject: (projectId: number) => void;
}

const calculateMappingStatus = (
  columnMappings: ColumnMapping[]
): 'complete' | 'incomplete' => {
  // Você pode adicionar lógica mais complexa aqui
  // Por exemplo, verificar se todas as colunas obrigatórias foram mapeadas
  return columnMappings.length > 0 ? 'complete' : 'incomplete';
};

const useMappingStore = create<MappingStore>()(
  persist(
    (set, get) => ({
      mappings: [],

      // Adicionar novo mapeamento
      addMapping: (projectId, name, columnMappings) => {
        const newMapping: Mapping = {
          id: Date.now(),
          projectId,
          name,
          columnMappings,
          status: calculateMappingStatus(columnMappings),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          mappings: [...state.mappings, newMapping],
        }));

        return newMapping;
      },

      // Atualizar mapeamento existente
      updateMapping: (id, updates) => {
        set((state) => ({
          mappings: state.mappings.map((mapping) => {
            if (mapping.id === id) {
              const updated = {
                ...mapping,
                ...updates,
                updatedAt: new Date().toISOString(),
              };

              // Recalcular status se os columnMappings foram atualizados
              if (updates.columnMappings) {
                updated.status = calculateMappingStatus(updates.columnMappings);
              }

              return updated;
            }
            return mapping;
          }),
        }));
      },

      // Deletar mapeamento
      deleteMapping: (id) => {
        set((state) => ({
          mappings: state.mappings.filter((mapping) => mapping.id !== id),
        }));
      },

      // Buscar mapeamento por ID
      getMappingById: (id) => {
        return get().mappings.find((mapping) => mapping.id === id);
      },

      // Buscar mapeamentos por projeto
      getMappingsByProject: (projectId) => {
        return get().mappings.filter(
          (mapping) => mapping.projectId === projectId
        );
      },

      // Buscar mapeamentos com termo de pesquisa
      searchMappings: (searchTerm, projectId) => {
        let mappings = get().mappings;

        // Filtrar por projeto se fornecido
        if (projectId) {
          mappings = mappings.filter(
            (mapping) => mapping.projectId === projectId
          );
        }

        // Se não houver termo de pesquisa, retornar todos
        if (!searchTerm) return mappings;

        const term = searchTerm.toLowerCase();

        return mappings.filter((mapping) => {
          // Buscar no nome do mapeamento
          if (mapping.name.toLowerCase().includes(term)) return true;

          // Buscar nos nomes das tabelas e colunas
          return mapping.columnMappings.some(
            (cm) =>
              cm.sourceTableName.toLowerCase().includes(term) ||
              cm.sourceColumnName.toLowerCase().includes(term) ||
              cm.destTableName.toLowerCase().includes(term) ||
              cm.destColumnName.toLowerCase().includes(term)
          );
        });
      },

      // Verificar se nome já existe
      mappingNameExists: (name, projectId, excludeId = null) => {
        return get().mappings.some(
          (mapping) =>
            mapping.projectId === projectId &&
            mapping.name.toLowerCase() === name.toLowerCase() &&
            mapping.id !== excludeId
        );
      },

      // Estatísticas dos mapeamentos
      getMappingStats: (projectId) => {
        const projectMappings = get().mappings.filter(
          (m) => m.projectId === projectId
        );

        return {
          total: projectMappings.length,
          complete: projectMappings.filter((m) => m.status === 'complete')
            .length,
          incomplete: projectMappings.filter((m) => m.status === 'incomplete')
            .length,
        };
      },

      // Limpar todos os mapeamentos
      clearAllMappings: () => {
        set({ mappings: [] });
      },

      // Limpar mapeamentos de um projeto específico
      clearMappingsByProject: (projectId) => {
        set((state) => ({
          mappings: state.mappings.filter(
            (mapping) => mapping.projectId !== projectId
          ),
        }));
      },
    }),
    {
      name: 'mappings-storage',
      partialize: (state) => ({
        mappings: state.mappings,
      }),
    }
  )
);

export default useMappingStore;
