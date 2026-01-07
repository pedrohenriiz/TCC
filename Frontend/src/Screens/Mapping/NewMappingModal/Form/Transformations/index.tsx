import { Field, FieldArray, useFormikContext } from 'formik';
import { ChevronDown, Zap, Info, AlertCircle, Plus, X } from 'lucide-react';
import Select from 'react-select';
import { useTransformations } from '../../../../../hooks/transformations/useTransformations';
import TransformationParams from './TransformationParams';
import { useMemo, useState } from 'react';

interface TransformationsSectionProps {
  columnIndex: number;
  mapping: any;
}

export default function TransformationsSection({
  columnIndex,
  mapping,
}: TransformationsSectionProps) {
  const { data: transformations, isLoading } = useTransformations();
  const { values, setFieldValue } = useFormikContext<any>();
  const [isExpanded, setIsExpanded] = useState(false);

  // Agrupa as transformações por categoria
  const groupedOptions = useMemo(() => {
    if (!transformations) return [];

    const categoryMap: Record<string, string> = {
      text: '📝 Texto',
      split_join: '✂️ Dividir/Juntar',
      numbers: '🔢 Números',
      dates: '📅 Datas',
      format_br: '📱 Formatação BR',
      conditional: '🔀 Condicionais',
      regex: '🔍 Avançado (Regex)',
      other: '📦 Outros',
    };

    const grouped = transformations.reduce((acc, trans) => {
      const category = trans.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        value: trans.id,
        label: trans.name,
        data: trans,
      });
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(grouped).map(([category, options]) => ({
      label: categoryMap[category] || categoryMap.other,
      options: options,
    }));
  }, [transformations]);

  // ✨ NOVA FUNÇÃO: Verifica se há ordens duplicadas
  const getDuplicateOrders = (transformations: any[]) => {
    const orders = transformations
      .map((t) => t.order)
      .filter((order) => order !== '' && order !== null && order !== undefined);

    const duplicates = orders.filter(
      (order, index) => orders.indexOf(order) !== index
    );
    return [...new Set(duplicates)]; // Remove duplicatas da lista de duplicatas
  };

  // ✨ NOVA FUNÇÃO: Verifica se uma ordem específica está duplicada
  const isOrderDuplicated = (currentIndex: number, orderValue: number) => {
    if (!mapping.transformations || !orderValue) return false;

    return mapping.transformations.some(
      (t: any, idx: number) =>
        idx !== currentIndex && Number(t.order) === Number(orderValue)
    );
  };

  if (isLoading) {
    return (
      <div className='bg-purple-50 border-2 border-dashed border-purple-300 rounded-xl p-4 mt-3'>
        <p className='text-center text-purple-700 text-sm'>
          Carregando transformações...
        </p>
      </div>
    );
  }

  const duplicateOrders = mapping.transformations
    ? getDuplicateOrders(mapping.transformations)
    : [];

  const hasTransformations =
    mapping.transformations && mapping.transformations.length > 0;

  return (
    <FieldArray name={`columns.${columnIndex}.transformations`}>
      {({ push, remove }) => {
        return (
          <div className='mt-3'>
            <button
              type='button'
              onClick={() => setIsExpanded(!isExpanded)}
              className='w-full bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-3 hover:from-purple-100 hover:to-purple-200 transition-all flex items-center justify-between group'
            >
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center'>
                  <Zap className='w-4 h-4 text-white' />
                </div>
                <div className='text-left'>
                  <h3 className='text-sm font-semibold text-gray-800'>
                    Transformações
                  </h3>
                  <p className='text-xs text-gray-600'>
                    {hasTransformations
                      ? `${mapping.transformations.length} transformação(ões) configurada(s)`
                      : 'Nenhuma transformação adicionada'}
                  </p>
                </div>

                {/* Badge de aviso se houver duplicatas */}
                {duplicateOrders.length > 0 && (
                  <div className='ml-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center gap-1'>
                    <AlertCircle className='w-3 h-3' />
                    Erro
                  </div>
                )}
              </div>

              {/* Ícone de expandir/colapsar */}
              <ChevronDown
                className={`w-5 h-5 text-purple-600 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isExpanded && (
              <div className='mt-2 bg-white border-2 border-purple-200 rounded-lg p-4'>
                {duplicateOrders.length > 0 && (
                  <div className='bg-red-50 border-2 border-red-300 rounded-lg p-3 mb-4 flex items-start gap-2 text-left'>
                    <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                    <div>
                      <p className='text-sm font-semibold text-red-800 mb-1'>
                        Ordens duplicadas detectadas
                      </p>
                      <p className='text-xs text-red-700'>
                        Ordens: {duplicateOrders.join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Lista de transformações */}
                {hasTransformations ? (
                  <div className='space-y-3 mb-4'>
                    {mapping.transformations.map(
                      (transform: any, tIndex: number) => {
                        const selectedTransformation = transformations?.find(
                          (t) =>
                            t.id === Number(transform.transformation_type_id)
                        );

                        const selectedValue = selectedTransformation
                          ? {
                              value: selectedTransformation.id,
                              label: selectedTransformation.name,
                              data: selectedTransformation,
                            }
                          : null;

                        const isDuplicated = isOrderDuplicated(
                          tIndex,
                          transform.order
                        );

                        return (
                          <div
                            key={tIndex}
                            className={`flex gap-3 items-start p-4 rounded-lg border-2 transition-all ${
                              isDuplicated
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-200 bg-gray-50 hover:border-purple-300'
                            }`}
                          >
                            {/* Badge de ordem */}
                            <div
                              className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ${
                                isDuplicated
                                  ? 'bg-red-600 text-white animate-pulse'
                                  : 'bg-purple-600 text-white'
                              }`}
                            >
                              {transform.order || '?'}
                            </div>

                            <div className='flex-1 space-y-3'>
                              {/* Select de transformação */}
                              <div>
                                <label className='block text-xs font-semibold text-gray-600 mb-2'>
                                  Tipo de Transformação
                                </label>
                                <Select
                                  value={selectedValue}
                                  options={groupedOptions}
                                  placeholder='Buscar transformação...'
                                  onChange={(option) => {
                                    if (option) {
                                      setFieldValue(
                                        `columns.${columnIndex}.transformations.${tIndex}.transformation_type_id`,
                                        option.value
                                      );
                                      setFieldValue(
                                        `columns.${columnIndex}.transformations.${tIndex}.param_values`,
                                        []
                                      );
                                    }
                                  }}
                                  styles={{
                                    control: (base, state) => ({
                                      ...base,
                                      borderWidth: '2px',
                                      borderColor: state.isFocused
                                        ? '#a855f7'
                                        : '#e5e7eb',
                                      boxShadow: state.isFocused
                                        ? '0 0 0 3px rgba(168, 85, 247, 0.1)'
                                        : 'none',
                                      '&:hover': { borderColor: '#a855f7' },
                                      borderRadius: '0.5rem',
                                      padding: '2px',
                                    }),
                                    menu: (base) => ({
                                      ...base,
                                      borderRadius: '0.5rem',
                                      border: '2px solid #e5e7eb',
                                      boxShadow:
                                        '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                      zIndex: 9999,
                                    }),
                                    option: (base, state) => ({
                                      ...base,
                                      backgroundColor: state.isSelected
                                        ? '#a855f7'
                                        : state.isFocused
                                        ? '#f3e8ff'
                                        : 'white',
                                      color: state.isSelected
                                        ? 'white'
                                        : '#374151',
                                      cursor: 'pointer',
                                      padding: '10px 12px',
                                    }),
                                    groupHeading: (base) => ({
                                      ...base,
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      color: '#6b7280',
                                      textTransform: 'uppercase',
                                      padding: '8px 12px',
                                    }),
                                  }}
                                  noOptionsMessage={() =>
                                    'Nenhuma transformação encontrada'
                                  }
                                  isClearable
                                  menuPortalTarget={document.body}
                                  menuPosition='fixed'
                                />
                                {selectedTransformation && (
                                  <p className='text-xs text-gray-500 mt-2 flex items-start gap-1'>
                                    <Info className='w-3 h-3 mt-0.5 flex-shrink-0' />
                                    {selectedTransformation.description}
                                  </p>
                                )}
                              </div>

                              {/* Campo de ordem */}
                              <div>
                                <label className='block text-xs font-semibold text-gray-600 mb-2'>
                                  Ordem de Execução
                                </label>
                                <Field
                                  type='number'
                                  name={`columns.${columnIndex}.transformations.${tIndex}.order`}
                                  min='1'
                                  placeholder='Ex: 1, 2, 3...'
                                  className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                    isDuplicated
                                      ? 'border-red-400 focus:ring-red-500 bg-red-50'
                                      : 'border-gray-200 focus:ring-purple-500 bg-white'
                                  }`}
                                />
                                {isDuplicated ? (
                                  <p className='text-xs text-red-600 mt-1 flex items-center gap-1'>
                                    <AlertCircle className='w-3 h-3' />
                                    Esta ordem já está sendo usada!
                                  </p>
                                ) : (
                                  <p className='text-xs text-gray-500 mt-1'>
                                    Transformações aplicadas em ordem crescente
                                  </p>
                                )}
                              </div>

                              {/* Parâmetros */}
                              {selectedTransformation?.schema_definitions &&
                                selectedTransformation.schema_definitions
                                  .length > 0 && (
                                  <TransformationParams
                                    columnIndex={columnIndex}
                                    transformationIndex={tIndex}
                                    schemaDefinitions={
                                      selectedTransformation.schema_definitions
                                    }
                                    currentValues={transform.param_values || []}
                                  />
                                )}
                            </div>

                            {/* Botão remover */}
                            <button
                              type='button'
                              onClick={() => remove(tIndex)}
                              className='flex-shrink-0 w-10 h-10 bg-red-100 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-200 hover:border-red-300 transition-colors flex items-center justify-center'
                              title='Remover transformação'
                            >
                              <X className='w-5 h-5' />
                            </button>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                      <Zap className='w-8 h-8 text-purple-600' />
                    </div>
                    <p className='text-sm text-gray-600 mb-1'>
                      Nenhuma transformação configurada
                    </p>
                    <p className='text-xs text-gray-500'>
                      Clique no botão abaixo para adicionar
                    </p>
                  </div>
                )}

                {/* Botão adicionar */}
                <button
                  type='button'
                  onClick={() => {
                    const newTransformation = {
                      transformation_type_id: '',
                      order: (mapping.transformations?.length || 0) + 1,
                      param_values: [],
                    };
                    push(newTransformation);
                  }}
                  className='w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2 shadow-sm'
                >
                  <Plus className='w-5 h-5' />
                  Adicionar Transformação
                </button>
              </div>
            )}
          </div>
        );
      }}
    </FieldArray>
  );
}
