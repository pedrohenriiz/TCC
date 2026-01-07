import { Field, FieldArray, useFormikContext } from 'formik';
import { useEffect } from 'react';

interface ParamDefinition {
  id: number;
  param_key: string;
  param_label: string;
  param_type: string;
  required: boolean;
  param_order: number;
}

interface TransformationParamsProps {
  columnIndex: number;
  transformationIndex: number;
  schemaDefinitions: ParamDefinition[];
  currentValues: any[];
}

export default function TransformationParams({
  columnIndex,
  transformationIndex,
  schemaDefinitions,
  currentValues,
}: TransformationParamsProps) {
  const { setFieldValue, values } = useFormikContext<any>();

  // Ordena as definições pela ordem
  const sortedDefinitions = [...schemaDefinitions].sort(
    (a, b) => a.param_order - b.param_order
  );

  // useEffect FORA do FieldArray
  useEffect(() => {
    const currentParamValues =
      values.columns?.[columnIndex]?.transformations?.[transformationIndex]
        ?.param_values || [];

    // Se não tem nenhum param_value, inicializa com os schemas
    if (currentParamValues.length === 0 && sortedDefinitions.length > 0) {
      const initialParams = sortedDefinitions.map((schema) => ({
        param_definition_id: schema.id,
        value: '',
      }));

      setFieldValue(
        `columns.${columnIndex}.transformations.${transformationIndex}.param_values`,
        initialParams
      );
    }
  }, [
    schemaDefinitions,
    columnIndex,
    transformationIndex,
    setFieldValue,
    values.columns,
    sortedDefinitions,
  ]);

  return (
    <div className='border-l-4 border-purple-300 pl-4 space-y-3'>
      <label className='block text-xs font-semibold text-gray-600'>
        Configurações
      </label>

      <FieldArray
        name={`columns.${columnIndex}.transformations.${transformationIndex}.param_values`}
      >
        {() => {
          return (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {sortedDefinitions.map((schema, schemaIndex) => {
                const fieldName = `columns.${columnIndex}.transformations.${transformationIndex}.param_values.${schemaIndex}.value`;
                const defIdFieldName = `columns.${columnIndex}.transformations.${transformationIndex}.param_values.${schemaIndex}.param_definition_id`;

                return (
                  <div key={schema.id}>
                    <label className='block text-xs text-gray-500 mb-1'>
                      {schema.param_label}
                      {schema.required && (
                        <span className='text-red-500 ml-1'>*</span>
                      )}
                    </label>

                    {/* Campo hidden para armazenar o param_definition_id */}
                    <Field
                      type='hidden'
                      name={defIdFieldName}
                      value={schema.id}
                    />

                    {/* Campo do valor baseado no tipo */}
                    {schema.param_type === 'number' ? (
                      <Field
                        type='number'
                        name={fieldName}
                        placeholder={getPlaceholder(schema.param_key)}
                        className='w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all'
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          // ✅ Usa setFieldValue do useFormikContext
                          const value = e.target.value;
                          setFieldValue(fieldName, value); // Salva como string
                        }}
                      />
                    ) : schema.param_type === 'select' ? (
                      <Field
                        as='select'
                        name={fieldName}
                        className='w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all'
                      >
                        <option value=''>Selecionar</option>
                        {getSelectOptions(schema.param_key).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Field>
                    ) : (
                      <Field
                        type='text'
                        name={fieldName}
                        placeholder={getPlaceholder(schema.param_key)}
                        className='w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all'
                      />
                    )}

                    {/* Helper text específico por parâmetro */}
                    {getHelperText(schema.param_key) && (
                      <p className='text-xs text-gray-500 mt-1'>
                        {getHelperText(schema.param_key)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }}
      </FieldArray>
    </div>
  );
}

function getSelectOptions(
  paramKey: string
): Array<{ value: string; label: string }> {
  const optionsMap: Record<string, Array<{ value: string; label: string }>> = {
    format_type: [
      { value: 'BRL', label: 'Real Brasileiro (R$)' },
      { value: 'USD', label: 'Dólar Americano ($)' },
      { value: 'EUR', label: 'Euro (€)' },
      { value: 'PERCENT', label: 'Porcentagem (%)' },
      { value: 'DECIMAL', label: 'Decimal (1.234,56)' },
    ],
    keep_spaces: [
      { value: 'true', label: 'Sim' },
      { value: 'false', label: 'Não' },
    ],
    direction: [
      { value: 'left', label: 'Esquerda' },
      { value: 'right', label: 'Direita' },
    ],
    operation: [
      { value: 'ADD', label: 'Somar' },
      { value: 'SUBTRACT', label: 'Subtrair' },
      { value: 'MULTIPLY', label: 'Multiplicar' },
      { value: 'DIVIDE', label: 'Dividir' },
    ],
    input_format: [
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (15/01/2024)' },
      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (01/15/2024)' },
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-01-15)' },
      { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD (2024/01/15)' },
      { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (15-01-2024)' },
      { value: 'YYYYMMDD', label: 'YYYYMMDD (20240115)' },
    ],
    output_format: [
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (15/01/2024)' },
      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (01/15/2024)' },
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-01-15)' },
      { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD (2024/01/15)' },
      { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (15-01-2024)' },
      { value: 'YYYYMMDD', label: 'YYYYMMDD (20240115)' },
    ],
    extract_part: [
      { value: 'day', label: 'Dia' },
      { value: 'month', label: 'Mês' },
      { value: 'year', label: 'Ano' },
      { value: 'year_short', label: 'Ano Curto (24)' },
      { value: 'month_name', label: 'Nome do Mês (Janeiro)' },
      { value: 'month_name_short', label: 'Mês Abreviado (Jan)' },
      { value: 'weekday', label: 'Dia da Semana (Segunda-feira)' },
      { value: 'weekday_short', label: 'Dia Semana Abreviado (Seg)' },
      { value: 'day_of_year', label: 'Dia do Ano (1-366)' },
      { value: 'week_of_year', label: 'Semana do Ano (1-53)' },
      { value: 'quarter', label: 'Trimestre (1-4)' },
    ],
    on_incomplete: [
      { value: 'keep_original', label: 'Manter Original' },
      { value: 'format_partial', label: 'Formatar Parcial' },
      { value: 'pad_zeros', label: 'Preencher com Zeros' },
      { value: 'error', label: 'Registrar Erro' },
      { value: 'empty', label: 'Retornar Vazio' },
    ],
    action: [
      { value: 'format', label: 'Adicionar Formatação' },
      { value: 'unformat', label: 'Remover Formatação' },
    ],
    document_type: [
      { value: 'CPF', label: 'CPF (123.456.789-00)' },
      { value: 'CNPJ', label: 'CNPJ (12.345.678/0001-90)' },
      { value: 'RG', label: 'RG (12.345.678-9)' },
      { value: 'CNH', label: 'CNH (123456789-00)' },
      { value: 'PIS', label: 'PIS/PASEP (123.45678.90-1)' },
      {
        value: 'TITULO_ELEITOR',
        label: 'Título de Eleitor (1234 5678 9012)',
      },
    ],
    trim_before: [
      { value: 'true', label: 'Sim (considerar "  " como vazio)' },
      { value: 'false', label: 'Não (manter espaços)' },
    ],
    treat_empty_as_null: [
      { value: 'true', label: 'Sim (null e vazio)' },
      { value: 'false', label: 'Não (apenas null)' },
    ],
    case_insensitive: [
      { value: 'true', label: 'Sim (A = a)' },
      { value: 'false', label: 'Não (A ≠ a)' },
    ],
    on_not_found: [
      { value: 'keep_original', label: 'Manter Original' },
      { value: 'empty', label: 'Retornar Vazio' },
      { value: 'error', label: 'Registrar Erro' },
    ],
  };

  return optionsMap[paramKey] || [];
}

// Funções auxiliares para placeholders e helper texts
function getPlaceholder(paramKey: string): string {
  const placeholders: Record<string, string> = {
    separator: 'Ex: espaço, vírgula, ponto...',
    index: 'Ex: 0 (primeiro), 1 (segundo), -1 (último)',
    format_type: 'Selecione o formato',
    decimals: 'Ex: 2 (duas casas decimais)',
    default_value: 'Ex: N/A, Não informado, 0, -',
    pattern: 'Ex: \\d+, [A-Z]+, \\s+',
    replacement: 'Ex: vazio, espaço, ***',
    group_index: 'Ex: 0 (tudo), 1 (primeiro grupo), 2 (segundo)',
  };
  return placeholders[paramKey] || '';
}

function getHelperText(paramKey: string): string | null {
  const helperTexts: Record<string, string> = {
    separator: '💡 Use " " para espaço, "," para vírgula, etc.',
    index: '💡 0 = primeiro elemento | 1 = segundo | -1 = último',
    format_type: '💡 Escolha como o número será formatado',
    decimals: '💡 Número de casas após a vírgula (padrão: 2)',
    action:
      '💡 Formatar: 11999887766 → (11) 99988-7766 | Desformatar: (11) 99988-7766 → 11999887766',
    default_value: '💡 Valor que será usado quando o campo estiver vazio',
    trim_before: '💡 Remove espaços antes de verificar se está vazio',
    treat_empty_as_null:
      '💡 Se ativo, strings vazias ("") também usarão o valor padrão',
    pattern: '💡 Expressão regular. Ex: \\d+ (números), [A-Z]+ (maiúsculas)',
    replacement: '💡 Texto que substituirá o padrão encontrado',
    case_insensitive: '💡 Se ativo, "ABC" e "abc" são considerados iguais',
    group_index: '💡 0 = match completo | 1+ = grupos capturados com ()',
    on_not_found: '💡 O que fazer se o padrão não for encontrado no texto',
  };
  return helperTexts[paramKey] || null;
}
