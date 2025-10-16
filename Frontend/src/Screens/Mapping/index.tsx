// pages/MappingPage.tsx
import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Plus,
  Trash2,
  Settings,
  Save,
  ArrowLeft,
  Eye,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import useSourceTablesStore from '../../store/useSourceTableStore';
import useTableConfigStore from '../../store/useTableConfigsStore';
import useMappingStore, {
  type ColumnMapping,
  type Transformation,
  type TransformationType,
} from '../../store/useMappingStore';

// ==========================================
// TIPOS
// ==========================================

interface TransformationOption {
  value: TransformationType;
  label: string;
  hasParams: boolean;
  params?: {
    name: string;
    type: 'text' | 'select';
    options?: string[];
  }[];
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const MappingPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Stores
  const { sourceTables } = useSourceTablesStore();
  const { tableConfigs } = useTableConfigStore();
  const {
    mappings,
    addMapping,
    getMappingByTables,
    addColumnMapping,
    updateColumnMapping,
    deleteColumnMapping,
    addTransformation,
    removeTransformation,
  } = useMappingStore();

  // Estado
  const [selectedSourceTable, setSelectedSourceTable] = useState<number | null>(
    null
  );
  const [selectedTargetTable, setSelectedTargetTable] = useState<number | null>(
    null
  );
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [currentMappingId, setCurrentMappingId] = useState<number | null>(null);

  // Carregar TODOS os mapeamentos para a tabela destino selecionada
  useEffect(() => {
    if (selectedTargetTable) {
      const allMappingsForTarget = mappings.filter(
        (m) => m.targetTableId === selectedTargetTable
      );

      // Juntar todos os column mappings de diferentes origens
      const allColumns = allMappingsForTarget.flatMap((m) => m.columnMappings);
      setColumnMappings(allColumns);
    } else {
      setColumnMappings([]);
    }
  }, [selectedTargetTable, mappings]);

  // Criar ou buscar mapeamento ao selecionar origem
  useEffect(() => {
    if (selectedSourceTable && selectedTargetTable) {
      const existingMapping = getMappingByTables(
        selectedSourceTable,
        selectedTargetTable
      );

      if (existingMapping) {
        setCurrentMappingId(existingMapping.id);
      } else {
        // Criar novo mapeamento automaticamente
        const sourceTableData = sourceTables.find(
          (t) => t.id === selectedSourceTable
        );
        const targetTableData = tableConfigs.find(
          (t) => t.id === selectedTargetTable
        );

        if (sourceTableData && targetTableData) {
          const newMapping = addMapping({
            projectId: parseInt(projectId || '0'),
            sourceTableId: selectedSourceTable,
            sourceTableName: sourceTableData.name,
            targetTableId: selectedTargetTable,
            targetTableName: targetTableData.table_name,
            columnMappings: [],
            executionOrder: 0,
            isActive: true,
          });

          setCurrentMappingId(newMapping.id);
        }
      }
    }
  }, [
    selectedSourceTable,
    selectedTargetTable,
    getMappingByTables,
    sourceTables,
    tableConfigs,
    addMapping,
    projectId,
  ]);

  // Opções de transformação
  const transformationOptions: TransformationOption[] = [
    { value: 'uppercase', label: 'MAIÚSCULO', hasParams: false },
    { value: 'lowercase', label: 'minúsculo', hasParams: false },
    { value: 'trim', label: 'Remover Espaços', hasParams: false },
    { value: 'titlecase', label: 'Primeira Maiúscula', hasParams: false },
    { value: 'format_phone', label: 'Formatar Telefone', hasParams: false },
    { value: 'format_cpf', label: 'Formatar CPF', hasParams: false },
    { value: 'format_cnpj', label: 'Formatar CNPJ', hasParams: false },
    {
      value: 'format_date',
      label: 'Formatar Data',
      hasParams: true,
      params: [
        {
          name: 'from',
          type: 'select',
          options: ['DD/MM/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY'],
        },
        {
          name: 'to',
          type: 'select',
          options: ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'],
        },
      ],
    },
    {
      value: 'static_value',
      label: 'Valor Fixo',
      hasParams: true,
      params: [{ name: 'value', type: 'text' }],
    },
  ];

  // Carregar ou criar mapeamento ao selecionar tabelas
  useEffect(() => {
    if (selectedSourceTable && selectedTargetTable) {
      const existingMapping = getMappingByTables(
        selectedSourceTable,
        selectedTargetTable
      );

      if (existingMapping) {
        // Carregar mapeamento existente e ADICIONAR aos atuais
        const newMappings = existingMapping.columnMappings.filter(
          (existing) =>
            !columnMappings.some((current) => current.id === existing.id)
        );
        setColumnMappings([...columnMappings, ...newMappings]);
        setCurrentMappingId(existingMapping.id);
      } else {
        // Criar novo mapeamento automaticamente
        const sourceTableData = sourceTables.find(
          (t) => t.id === selectedSourceTable
        );
        const targetTableData = tableConfigs.find(
          (t) => t.id === selectedTargetTable
        );

        if (sourceTableData && targetTableData) {
          const newMapping = addMapping({
            projectId: parseInt(projectId || '0'),
            sourceTableId: selectedSourceTable,
            sourceTableName: sourceTableData.name,
            targetTableId: selectedTargetTable,
            targetTableName: targetTableData.table_name,
            columnMappings: [],
            executionOrder: 0,
            isActive: true,
          });

          // NÃO limpa os mapeamentos existentes
          setCurrentMappingId(newMapping.id);
        }
      }
    }
  }, [
    selectedSourceTable,
    selectedTargetTable,
    getMappingByTables,
    sourceTables,
    tableConfigs,
    addMapping,
    projectId,
  ]);

  // Obter tabela origem selecionada
  const sourceTable = sourceTables.find((t) => t.id === selectedSourceTable);
  const targetTable = tableConfigs.find((t) => t.id === selectedTargetTable);

  // Adicionar mapeamento de coluna (instantâneo)
  const handleAddColumnMapping = (sourceColumn: string) => {
    // Verificar se já existe (de qualquer origem)
    const exists = columnMappings.find(
      (cm) => cm.sourceColumn === sourceColumn
    );
    if (exists) {
      alert(
        'Esta coluna já foi mapeada. Remova o mapeamento existente primeiro.'
      );
      return;
    }

    if (!currentMappingId) {
      alert('Selecione uma tabela de origem primeiro');
      return;
    }

    const newMapping: ColumnMapping = {
      id: Date.now() + Math.random(),
      sourceColumn,
      targetColumn: '',
      transformations: [],
      isRequired: false,
      defaultValue: null,
    };

    // Adicionar na store
    addColumnMapping(currentMappingId, newMapping);
  };

  // Atualizar coluna destino (salva automaticamente)
  const handleUpdateTargetColumn = (
    columnMappingId: number,
    targetColumn: string
  ) => {
    // Buscar qual mapeamento contém esta coluna
    const mapping = mappings.find((m) =>
      m.columnMappings.some((cm) => cm.id === columnMappingId)
    );

    if (mapping) {
      updateColumnMapping(mapping.id, columnMappingId, { targetColumn });
    }
  };

  // Remover mapeamento de coluna (instantâneo)
  const handleRemoveColumnMapping = (columnMappingId: number) => {
    // Buscar qual mapeamento contém esta coluna
    const mapping = mappings.find((m) =>
      m.columnMappings.some((cm) => cm.id === columnMappingId)
    );

    if (mapping) {
      deleteColumnMapping(mapping.id, columnMappingId);
    }
  };

  // Adicionar transformação (instantânea)
  const handleAddTransformation = (
    columnMappingId: number,
    transformationType: TransformationType
  ) => {
    const transformation: Transformation = {
      type: transformationType,
      params: {},
    };

    // Buscar qual mapeamento contém esta coluna
    const mapping = mappings.find((m) =>
      m.columnMappings.some((cm) => cm.id === columnMappingId)
    );

    if (mapping) {
      addTransformation(mapping.id, columnMappingId, transformation);
    }
  };

  // Remover transformação (instantânea)
  const handleRemoveTransformation = (
    columnMappingId: number,
    transformationIndex: number
  ) => {
    // Buscar qual mapeamento contém esta coluna
    const mapping = mappings.find((m) =>
      m.columnMappings.some((cm) => cm.id === columnMappingId)
    );

    if (mapping) {
      removeTransformation(mapping.id, columnMappingId, transformationIndex);
    }
  };

  // Atualizar parâmetro de transformação
  const handleUpdateTransformationParam = (
    columnMappingId: number,
    transformationIndex: number,
    paramName: string,
    value: string
  ) => {
    setColumnMappings(
      columnMappings.map((cm) =>
        cm.id === columnMappingId
          ? {
              ...cm,
              transformations: cm.transformations.map((t, i) =>
                i === transformationIndex
                  ? { ...t, params: { ...t.params, [paramName]: value } }
                  : t
              ),
            }
          : cm
      )
    );
  };

  // Salvar mapeamento final (apenas validação)
  const handleSave = () => {
    if (!selectedSourceTable || !selectedTargetTable) {
      alert('Selecione as tabelas de origem e destino');
      return;
    }

    if (columnMappings.length === 0) {
      alert('Adicione pelo menos um mapeamento de coluna');
      return;
    }

    // Validar se todas as colunas têm destino
    const invalidMappings = columnMappings.filter((cm) => !cm.targetColumn);
    if (invalidMappings.length > 0) {
      alert('Todas as colunas mapeadas devem ter uma coluna de destino');
      return;
    }

    alert(
      'Mapeamento salvo com sucesso! Todas as alterações já foram salvas automaticamente.'
    );

    // Resetar para novo mapeamento
    setSelectedSourceTable(null);
    setSelectedTargetTable(null);
    setColumnMappings([]);
    setCurrentMappingId(null);
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate(`/projects/${projectId}/source-tables`)}
              className='p-2 hover:bg-gray-100 rounded-lg transition'
            >
              <ArrowLeft className='w-5 h-5' />
            </button>
            <ArrowRight className='w-8 h-8 text-blue-600' />
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>
                Mapeamento de Dados
              </h1>
              <p className='text-gray-600 text-sm'>
                Configure como os dados serão mapeados da origem para o destino
              </p>
            </div>
          </div>
        </div>

        {/* Seleção de Tabelas */}
        <div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
          <h2 className='text-lg font-semibold mb-4'>Selecionar Tabelas</h2>
          <div className='grid grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Tabela Origem
              </label>
              <select
                value={selectedSourceTable || ''}
                onChange={(e) =>
                  setSelectedSourceTable(parseInt(e.target.value))
                }
                className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none'
              >
                <option value=''>Selecione a tabela origem</option>
                {sourceTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name} ({table.columns?.length || 0} colunas)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                Tabela Destino
              </label>
              <select
                value={selectedTargetTable || ''}
                onChange={(e) =>
                  setSelectedTargetTable(parseInt(e.target.value))
                }
                className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none'
              >
                <option value=''>Selecione a tabela destino</option>
                {tableConfigs.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.displayName || table.table_name} (
                    {table.columns?.length || 0} colunas)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Colunas Disponíveis */}
        {selectedSourceTable && selectedTargetTable && (
          <>
            <div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
              <h2 className='text-lg font-semibold mb-4'>
                Colunas Disponíveis - {sourceTable?.name}
              </h2>
              <div className='flex flex-wrap gap-2'>
                {sourceTable?.columns?.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => handleAddColumnMapping(col.name)}
                    disabled={columnMappings.some(
                      (cm) => cm.sourceColumn === col.name
                    )}
                    className='flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition'
                  >
                    <Plus className='w-4 h-4' />
                    {col.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mapeamentos de Colunas - Mostra TODOS os mapeamentos */}
            {columnMappings.length > 0 && (
              <div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
                <h2 className='text-lg font-semibold mb-4'>
                  Mapeamento de Colunas ({columnMappings.length})
                </h2>
                <div className='space-y-4'>
                  {columnMappings.map((cm) => {
                    // Buscar de qual tabela origem vem esta coluna
                    const mappingOrigin = mappings.find((m) =>
                      m.columnMappings.some((col) => col.id === cm.id)
                    );
                    const originTableName = mappingOrigin
                      ? mappingOrigin.sourceTableName
                      : '';

                    return (
                      <div
                        key={cm.id}
                        className='border rounded-lg p-4 bg-gray-50'
                      >
                        <div className='grid grid-cols-12 gap-3 items-start'>
                          {/* Coluna Origem */}
                          <div className='col-span-3'>
                            <label className='block text-xs text-gray-600 mb-1'>
                              Origem
                            </label>
                            <div className='bg-blue-50 px-3 py-2 rounded'>
                              <div className='font-mono text-sm font-semibold'>
                                {cm.sourceColumn}
                              </div>
                              <div className='text-xs text-gray-500 mt-1'>
                                📁 {originTableName}
                              </div>
                            </div>
                          </div>

                          <div className='col-span-1 flex items-center justify-center pt-6'>
                            <ArrowRight className='w-5 h-5 text-gray-400' />
                          </div>

                          {/* Coluna Destino */}
                          <div className='col-span-3'>
                            <label className='block text-xs text-gray-600 mb-1'>
                              Destino
                            </label>
                            <select
                              value={cm.targetColumn}
                              onChange={(e) =>
                                handleUpdateTargetColumn(cm.id, e.target.value)
                              }
                              className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none'
                            >
                              <option value=''>Selecione...</option>
                              {targetTable?.columns?.map((col) => (
                                <option key={col.id} value={col.column_name}>
                                  {col.column_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Transformações */}
                          <div className='col-span-4'>
                            <label className='block text-xs text-gray-600 mb-1'>
                              <Settings className='w-3 h-3 inline mr-1' />
                              Transformações
                            </label>
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAddTransformation(
                                    cm.id,
                                    e.target.value as TransformationType
                                  );
                                  e.target.value = '';
                                }
                              }}
                              className='w-full px-3 py-2 border rounded-lg text-sm'
                            >
                              <option value=''>
                                + Adicionar transformação
                              </option>
                              {transformationOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>

                            {/* Lista de Transformações */}
                            {cm.transformations.length > 0 && (
                              <div className='mt-2 space-y-1'>
                                {cm.transformations.map((trans, idx) => {
                                  const transOption =
                                    transformationOptions.find(
                                      (t) => t.value === trans.type
                                    );
                                  return (
                                    <div
                                      key={idx}
                                      className='flex items-center gap-2 bg-yellow-50 px-2 py-1 rounded text-xs'
                                    >
                                      <span className='flex-1'>
                                        {transOption?.label || trans.type}
                                      </span>
                                      <button
                                        onClick={() =>
                                          handleRemoveTransformation(cm.id, idx)
                                        }
                                        className='text-red-600 hover:text-red-800'
                                      >
                                        <X className='w-3 h-3' />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Remover */}
                          <div className='col-span-1 flex items-center justify-center pt-6'>
                            <button
                              onClick={() => handleRemoveColumnMapping(cm.id)}
                              className='text-red-600 hover:text-red-800'
                            >
                              <Trash2 className='w-4 h-4' />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className='bg-white rounded-lg shadow-lg p-4 mb-6'>
              <div className='flex items-center gap-3 text-sm text-gray-600'>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                  <span>
                    Auto-save ativado - Todas as alterações são salvas
                    automaticamente
                  </span>
                </div>
              </div>
            </div>

            <div className='flex justify-between'>
              <button
                onClick={() => {
                  setSelectedSourceTable(null);
                  setSelectedTargetTable(null);
                  setColumnMappings([]);
                  setCurrentMappingId(null);
                }}
                className='px-6 py-3 border rounded-lg hover:bg-gray-50'
              >
                Nova Tabela
              </button>
              <button
                onClick={handleSave}
                disabled={
                  columnMappings.length === 0 ||
                  columnMappings.some((cm) => !cm.targetColumn)
                }
                className='flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold'
              >
                <Save className='w-5 h-5' />
                Finalizar Mapeamento
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MappingPage;
