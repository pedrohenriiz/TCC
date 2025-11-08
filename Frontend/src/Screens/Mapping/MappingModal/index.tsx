import React, { useState } from 'react';
import { X, Plus, Trash2, Zap, Lightbulb, Save } from 'lucide-react';
import LargeModal from '../../../components/LargeModal';

const MappingModal = ({ isOpen, onClose }) => {
  const [mappingName, setMappingName] = useState('');
  const [mappings, setMappings] = useState([
    {
      id: 1,
      sourceTable: '',
      sourceColumn: '',
      destTable: '',
      destColumn: '',
      transformations: [],
    },
  ]);

  const transformationOptions = [
    { value: 'trim', label: '✂️ Trim - Remove espaços' },
    { value: 'uppercase', label: '🔤 Uppercase - Maiúsculas' },
    { value: 'lowercase', label: '🔡 Lowercase - Minúsculas' },
    { value: 'split', label: '✂️ Split - Dividir texto' },
    { value: 'concat', label: '🔗 Concatenar' },
    { value: 'formatNumber', label: '🔢 Formatar número' },
    { value: 'formatDate', label: '📅 Formatar data' },
  ];

  const tableOptions = [
    { value: 'clientes', label: 'Clientes' },
    { value: 'produtos', label: 'Produtos' },
    { value: 'pedidos', label: 'Pedidos' },
  ];

  const columnOptions = [
    { value: 'id', label: 'id' },
    { value: 'nome_completo', label: 'nome_completo' },
    { value: 'email', label: 'email' },
  ];

  const addMapping = () => {
    const newMapping = {
      id: Date.now(),
      sourceTable: '',
      sourceColumn: '',
      destTable: '',
      destColumn: '',
      transformations: [],
    };
    setMappings([...mappings, newMapping]);
  };

  const deleteMapping = (id) => {
    if (window.confirm('Deseja remover este mapeamento?')) {
      setMappings(mappings.filter((m) => m.id !== id));
    }
  };

  const updateMapping = (id, field, value) => {
    setMappings(
      mappings.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const addTransformation = (mappingId) => {
    setMappings(
      mappings.map((m) => {
        if (m.id === mappingId) {
          return {
            ...m,
            transformations: [
              ...m.transformations,
              { id: Date.now(), type: '', config: {} },
            ],
          };
        }
        return m;
      })
    );
  };

  const removeTransformation = (mappingId, transformId) => {
    setMappings(
      mappings.map((m) => {
        if (m.id === mappingId) {
          return {
            ...m,
            transformations: m.transformations.filter(
              (t) => t.id !== transformId
            ),
          };
        }
        return m;
      })
    );
  };

  const updateTransformation = (mappingId, transformId, value) => {
    setMappings(
      mappings.map((m) => {
        if (m.id === mappingId) {
          return {
            ...m,
            transformations: m.transformations.map((t) =>
              t.id === transformId ? { ...t, type: value } : t
            ),
          };
        }
        return m;
      })
    );
  };

  const updateTransformationConfig = (
    mappingId,
    transformId,
    configKey,
    configValue
  ) => {
    setMappings(
      mappings.map((m) => {
        if (m.id === mappingId) {
          return {
            ...m,
            transformations: m.transformations.map((t) =>
              t.id === transformId
                ? { ...t, config: { ...t.config, [configKey]: configValue } }
                : t
            ),
          };
        }
        return m;
      })
    );
  };

  const handleSave = () => {
    if (!mappingName.trim()) {
      alert('Por favor, preencha o nome do mapeamento');
      return;
    }

    if (mappings.length === 0) {
      alert('Adicione pelo menos um mapeamento antes de salvar');
      return;
    }

    alert(
      `Mapeamento "${mappingName}" salvo com sucesso!\n${mappings.length} mapeamento(s) configurado(s).`
    );
  };

  const handleClose = () => {
    if (
      window.confirm(
        'Tem certeza que deseja fechar? As alterações não salvas serão perdidas.'
      )
    ) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <LargeModal
      title='Mapear colunas'
      isSubmitting={false}
      isValid={true}
      onClose={handleClose}
      onSubmit={handleSave}
    >
      {/* Body */}
      <div className='flex-1 overflow-y-auto px-8 py-8'>
        {/* Nome do Mapeamento */}
        <div className='mb-8 text-left'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Nome do Mapeamento <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            value={mappingName}
            onChange={(e) => setMappingName(e.target.value)}
            placeholder='Ex: Clientes para Sistema Novo'
            className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
          />
          <p className='text-sm text-gray-500 mt-2'>
            Dê um nome descritivo para identificar este mapeamento
          </p>
        </div>

        {/* Mapeamentos */}
        <div>
          <div className='flex items-center gap-2 mb-4'>
            <span className='text-lg'>🔗</span>
            <h2 className='text-base font-semibold text-gray-700'>
              Mapeamento de Colunas
            </h2>
          </div>

          <div className='space-y-4'>
            {mappings.length === 0 ? (
              <div className='text-center py-10 text-gray-500'>
                <div className='text-5xl mb-4'>📋</div>
                <p>Nenhum mapeamento adicionado ainda</p>
                <p className='text-sm mt-2'>
                  Clique no botão abaixo para adicionar seu primeiro mapeamento
                </p>
              </div>
            ) : (
              mappings.map((mapping) => (
                <div
                  key={mapping.id}
                  className='bg-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-md transition-all'
                >
                  {/* Grid de Seleção */}
                  <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-5'>
                    <div>
                      <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                        Tabela Origem
                      </label>
                      <select
                        value={mapping.sourceTable}
                        onChange={(e) =>
                          updateMapping(
                            mapping.id,
                            'sourceTable',
                            e.target.value
                          )
                        }
                        className='w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                      >
                        <option value=''>Selecionar</option>
                        {tableOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                        Coluna Origem
                      </label>
                      <select
                        value={mapping.sourceColumn}
                        onChange={(e) =>
                          updateMapping(
                            mapping.id,
                            'sourceColumn',
                            e.target.value
                          )
                        }
                        className='w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                      >
                        <option value=''>Selecionar</option>
                        {columnOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                        Tabela Destino
                      </label>
                      <select
                        value={mapping.destTable}
                        onChange={(e) =>
                          updateMapping(mapping.id, 'destTable', e.target.value)
                        }
                        className='w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                      >
                        <option value=''>Selecionar</option>
                        <option value='customers'>Customers</option>
                        <option value='products'>Products</option>
                        <option value='orders'>Orders</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                        Coluna Destino
                      </label>
                      <select
                        value={mapping.destColumn}
                        onChange={(e) =>
                          updateMapping(
                            mapping.id,
                            'destColumn',
                            e.target.value
                          )
                        }
                        className='w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                      >
                        <option value=''>Selecionar</option>
                        <option value='customer_id'>customer_id</option>
                        <option value='full_name'>full_name</option>
                        <option value='email_address'>email_address</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                        Ações
                      </label>
                      <button
                        onClick={() => deleteMapping(mapping.id)}
                        className='w-full h-10 bg-red-100 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-200 hover:border-red-300 transition-colors flex items-center justify-center'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </div>

                  {/* Pipeline de Transformações */}
                  <div className='bg-amber-50 border-2 border-dashed border-amber-400 rounded-xl p-6'>
                    {/* Lista de Transformações */}
                    <div className='mb-4'>
                      {mapping.transformations.length === 0 ? (
                        <p className='text-center text-amber-900 text-sm mb-3'>
                          Sem transformações
                        </p>
                      ) : (
                        <div className='space-y-3'>
                          {mapping.transformations.map((transform) => (
                            <div
                              key={transform.id}
                              className='flex flex-col gap-3 p-3 bg-white rounded-lg border border-amber-200'
                            >
                              <div className='flex gap-3 items-center'>
                                <select
                                  value={transform.type}
                                  onChange={(e) =>
                                    updateTransformation(
                                      mapping.id,
                                      transform.id,
                                      e.target.value
                                    )
                                  }
                                  className='flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                                >
                                  <option value=''>
                                    Selecionar transformação
                                  </option>
                                  {transformationOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() =>
                                    removeTransformation(
                                      mapping.id,
                                      transform.id
                                    )
                                  }
                                  className='w-9 h-9 bg-red-100 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-200 hover:border-red-300 transition-colors flex items-center justify-center'
                                >
                                  <X className='w-4 h-4' />
                                </button>
                              </div>

                              {/* Configuração para Split */}
                              {transform.type === 'split' && (
                                <div className='flex flex-col gap-2 pl-2 border-l-4 border-amber-300'>
                                  <label className='text-xs font-semibold text-gray-600'>
                                    Configuração do Split
                                  </label>
                                  <div className='grid grid-cols-2 gap-3'>
                                    <div>
                                      <label className='block text-xs text-gray-500 mb-1'>
                                        Separador
                                      </label>
                                      <input
                                        type='text'
                                        value={
                                          transform.config?.separator || ' '
                                        }
                                        onChange={(e) =>
                                          updateTransformationConfig(
                                            mapping.id,
                                            transform.id,
                                            'separator',
                                            e.target.value
                                          )
                                        }
                                        placeholder='Ex: espaço, vírgula...'
                                        className='w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                                      />
                                    </div>
                                    <div>
                                      <label className='block text-xs text-gray-500 mb-1'>
                                        Posição do Array
                                      </label>
                                      <input
                                        type='text'
                                        value={transform.config?.position || ''}
                                        onChange={(e) =>
                                          updateTransformationConfig(
                                            mapping.id,
                                            transform.id,
                                            'position',
                                            e.target.value
                                          )
                                        }
                                        placeholder='Ex: 0, 1, 1:, :2'
                                        className='w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                                      />
                                    </div>
                                  </div>
                                  <p className='text-xs text-gray-500 mt-1'>
                                    💡 <strong>Exemplos:</strong> "0" = primeiro
                                    elemento | "1" = segundo elemento | "1:" =
                                    do segundo em diante | ":2" = até o segundo
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => addTransformation(mapping.id)}
                      className='bg-white border-2 border-dashed border-amber-600 text-amber-700 px-5 py-3 rounded-lg font-medium hover:bg-amber-100 hover:border-amber-700 transition-all inline-flex items-center gap-2'
                    >
                      <Plus className='w-4 h-4' />
                      Adicionar Transformação
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={addMapping}
            className='w-full mt-4 bg-blue-500 text-white px-6 py-4 rounded-lg font-medium hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center justify-center gap-2'
          >
            <Plus className='w-5 h-5' />
            Adicionar Mapeamento
          </button>
        </div>
      </div>
    </LargeModal>
  );
};

export default MappingModal;
