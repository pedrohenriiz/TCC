// store/useMappingStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==========================================
// TIPOS E INTERFACES
// ==========================================

export type TransformationType =
  | 'uppercase'
  | 'lowercase'
  | 'trim'
  | 'titlecase'
  | 'format_phone'
  | 'format_cpf'
  | 'format_cnpj'
  | 'format_date'
  | 'static_value'
  | 'concat'
  | 'split'
  | 'replace'
  | 'substring';

export interface Transformation {
  type: TransformationType;
  params?: Record<string, any>;
}

export interface ColumnMapping {
  id: number;
  sourceColumn: string;
  targetColumn: string;
  transformations: Transformation[];
  isRequired: boolean;
  defaultValue?: string | null;
}

export interface TableMapping {
  id: number;
  projectId: number;
  sourceTableId: number;
  sourceTableName: string;
  targetTableId: number;
  targetTableName: string;
  columnMappings: ColumnMapping[];
  executionOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MappingStore {
  mappings: TableMapping[];
  currentMapping: TableMapping | null;

  // CRUD de mapeamentos
  addMapping: (
    mapping: Omit<TableMapping, 'id' | 'createdAt' | 'updatedAt'>
  ) => TableMapping;
  updateMapping: (id: number, updates: Partial<TableMapping>) => void;
  deleteMapping: (id: number) => void;
  getMappingById: (id: number) => TableMapping | undefined;

  // Gerenciar mapeamento atual
  setCurrentMapping: (mapping: TableMapping | null) => void;
  clearCurrentMapping: () => void;

  // Gerenciar mapeamentos de colunas
  addColumnMapping: (
    mappingId: number,
    columnMapping: Omit<ColumnMapping, 'id'>
  ) => void;
  updateColumnMapping: (
    mappingId: number,
    columnMappingId: number,
    updates: Partial<ColumnMapping>
  ) => void;
  deleteColumnMapping: (mappingId: number, columnMappingId: number) => void;

  // Transformações
  addTransformation: (
    mappingId: number,
    columnMappingId: number,
    transformation: Transformation
  ) => void;
  removeTransformation: (
    mappingId: number,
    columnMappingId: number,
    transformationIndex: number
  ) => void;

  // Buscar mapeamentos por projeto
  getMappingsByProject: (projectId: number) => TableMapping[];

  // Buscar mapeamento por tabelas
  getMappingByTables: (
    sourceTableId: number,
    targetTableId: number
  ) => TableMapping | undefined;

  // Limpar tudo
  clearAllMappings: () => void;
}

// ==========================================
// STORE
// ==========================================

const useMappingStore = create<MappingStore>()(
  persist(
    (set, get) => ({
      mappings: [],
      currentMapping: null,

      // Adicionar mapeamento
      addMapping: (mapping) => {
        const newMapping: TableMapping = {
          ...mapping,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          mappings: [...state.mappings, newMapping],
        }));

        return newMapping;
      },

      // Atualizar mapeamento
      updateMapping: (id, updates) => {
        set((state) => ({
          mappings: state.mappings.map((mapping) =>
            mapping.id === id
              ? {
                  ...mapping,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : mapping
          ),
        }));
      },

      // Deletar mapeamento
      deleteMapping: (id) => {
        set((state) => ({
          mappings: state.mappings.filter((mapping) => mapping.id !== id),
          currentMapping:
            state.currentMapping?.id === id ? null : state.currentMapping,
        }));
      },

      // Buscar por ID
      getMappingById: (id) => {
        return get().mappings.find((mapping) => mapping.id === id);
      },

      // Definir mapeamento atual
      setCurrentMapping: (mapping) => {
        set({ currentMapping: mapping });
      },

      // Limpar mapeamento atual
      clearCurrentMapping: () => {
        set({ currentMapping: null });
      },

      // Adicionar mapeamento de coluna
      addColumnMapping: (mappingId, columnMapping) => {
        const newColumnMapping: ColumnMapping = {
          ...columnMapping,
          id: Date.now() + Math.random(),
        };

        set((state) => ({
          mappings: state.mappings.map((mapping) =>
            mapping.id === mappingId
              ? {
                  ...mapping,
                  columnMappings: [...mapping.columnMappings, newColumnMapping],
                  updatedAt: new Date().toISOString(),
                }
              : mapping
          ),
        }));
      },

      // Atualizar mapeamento de coluna
      updateColumnMapping: (mappingId, columnMappingId, updates) => {
        set((state) => ({
          mappings: state.mappings.map((mapping) =>
            mapping.id === mappingId
              ? {
                  ...mapping,
                  columnMappings: mapping.columnMappings.map((cm) =>
                    cm.id === columnMappingId ? { ...cm, ...updates } : cm
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : mapping
          ),
        }));
      },

      // Deletar mapeamento de coluna
      deleteColumnMapping: (mappingId, columnMappingId) => {
        set((state) => ({
          mappings: state.mappings.map((mapping) =>
            mapping.id === mappingId
              ? {
                  ...mapping,
                  columnMappings: mapping.columnMappings.filter(
                    (cm) => cm.id !== columnMappingId
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : mapping
          ),
        }));
      },

      // Adicionar transformação
      addTransformation: (mappingId, columnMappingId, transformation) => {
        set((state) => ({
          mappings: state.mappings.map((mapping) =>
            mapping.id === mappingId
              ? {
                  ...mapping,
                  columnMappings: mapping.columnMappings.map((cm) =>
                    cm.id === columnMappingId
                      ? {
                          ...cm,
                          transformations: [
                            ...cm.transformations,
                            transformation,
                          ],
                        }
                      : cm
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : mapping
          ),
        }));
      },

      // Remover transformação
      removeTransformation: (
        mappingId,
        columnMappingId,
        transformationIndex
      ) => {
        set((state) => ({
          mappings: state.mappings.map((mapping) =>
            mapping.id === mappingId
              ? {
                  ...mapping,
                  columnMappings: mapping.columnMappings.map((cm) =>
                    cm.id === columnMappingId
                      ? {
                          ...cm,
                          transformations: cm.transformations.filter(
                            (_, index) => index !== transformationIndex
                          ),
                        }
                      : cm
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : mapping
          ),
        }));
      },

      // Buscar por projeto
      getMappingsByProject: (projectId) => {
        return get().mappings.filter(
          (mapping) => mapping.projectId === projectId
        );
      },

      // Buscar por tabelas
      getMappingByTables: (sourceTableId, targetTableId) => {
        return get().mappings.find(
          (mapping) =>
            mapping.sourceTableId === sourceTableId &&
            mapping.targetTableId === targetTableId
        );
      },

      // Limpar tudo
      clearAllMappings: () => {
        set({ mappings: [], currentMapping: null });
      },
    }),
    {
      name: 'mapping-storage',
      partialize: (state) => ({
        mappings: state.mappings,
      }),
    }
  )
);

export default useMappingStore;
