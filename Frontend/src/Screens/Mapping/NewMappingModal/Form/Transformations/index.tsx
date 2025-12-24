export default function Transformations() {
  return (
    <FieldArray name={`mappings.${index}.transformations`}>
      {({ push: pushTransform, remove: removeTransform }) => (
        <div className='bg-amber-50 border-2 border-dashed border-amber-400 rounded-xl p-6'>
          <div className='mb-4'>
            {mapping.transformations.length === 0 ? (
              <p className='text-center text-amber-900 text-sm mb-3'>
                Sem transformações
              </p>
            ) : (
              <div className='space-y-3'>
                {mapping.transformations.map((transform, tIndex) => (
                  <div
                    key={transform?.id}
                    className='flex flex-col gap-3 p-3 bg-white rounded-lg border border-amber-200'
                  >
                    <div className='flex gap-3 items-center'>
                      <Field
                        as='select'
                        name={`mappings.${index}.transformations.${tIndex}.type`}
                        className='flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                      >
                        <option value=''>Selecionar transformação</option>
                        {transformationOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Field>
                      <button
                        type='button'
                        onClick={() => removeTransform(tIndex)}
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
                            <Field
                              name={`mappings.${index}.transformations.${tIndex}.config.separator`}
                              type='text'
                              placeholder='Ex: espaço, vírgula...'
                              className='w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                            />
                          </div>
                          <div>
                            <label className='block text-xs text-gray-500 mb-1'>
                              Posição do Array
                            </label>
                            <Field
                              name={`mappings.${index}.transformations.${tIndex}.config.position`}
                              type='text'
                              placeholder='Ex: 0, 1, 1:, :2'
                              className='w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                            />
                          </div>
                        </div>
                        <p className='text-xs text-gray-500 mt-1'>
                          💡 <strong>Exemplos:</strong> "0" = primeiro elemento
                          | "1" = segundo elemento | "1:" = do segundo em diante
                          | ":2" = até o segundo
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type='button'
            onClick={() =>
              pushTransform({
                id: Date.now(),
                type: '',
                config: {},
              })
            }
            className='bg-white border-2 border-dashed border-amber-600 text-amber-700 px-5 py-3 rounded-lg font-medium hover:bg-amber-100 hover:border-amber-700 transition-all inline-flex items-center gap-2'
          >
            <Plus className='w-4 h-4' />
            Adicionar Transformação
          </button>
        </div>
      )}
    </FieldArray>
  );
}
