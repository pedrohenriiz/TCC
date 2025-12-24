import { Field, FieldArray } from 'formik';
import type { FormValuesProps } from '..';
import { Plus, Trash2 } from 'lucide-react';
import ConfirmButton from '../../../../components/ConfirmButton';

interface TableOptionsProps {
  id: number;
  name: string;
}

interface DestinyDataProps {
  columns: {
    foreign_table_id: number;
    id: number;
    name: string;
    type: string;
  }[];
  created_at: string;
  exhibition_name: string;
  id: number;
  name: string;
  total_columns: number;
  total_foreign_keys: number;
}

interface OriginDataProps {
  updated_at: string;
  name: string;
  migration_project_id: number;
  id: number;
  deleted_at: string;
  created_at: string;
  columns: {
    deleted_at: string;
    id: number;
    is_pk: number;
    name: string;
    origin_table_id: number;
    type: string;
    updated_at: string;
  }[];
}

interface MappingFormProps {
  values: FormValuesProps;
  tableOptions: TableOptionsProps[];
  destinyData: DestinyDataProps[];
  originData: OriginDataProps[];
}

export default function MappingForm({
  values,
  destinyData,
  originData,
  tableOptions,
}: MappingFormProps) {
  //   const transformationOptions = [
  //     { value: 'trim', label: '✂️ Trim - Remove espaços' },
  //     { value: 'uppercase', label: '🔤 Uppercase - Maiúsculas' },
  //     { value: 'lowercase', label: '🔡 Lowercase - Minúsculas' },
  //     { value: 'split', label: '✂️ Split - Dividir texto' },
  //     { value: 'concat', label: '🔗 Concatenar' },
  //     { value: 'formatNumber', label: '🔢 Formatar número' },
  //     { value: 'formatDate', label: '📅 Formatar data' },
  //   ];

  console.log('originData', originData);

  const getDestinyColumnsByTableId = (destinyTableId: number) => {
    if (!destinyTableId) {
      return [];
    }

    const selectedDestinyTable = destinyData.find(
      (table) => table.id === Number(destinyTableId)
    );

    if (selectedDestinyTable?.columns) {
      return selectedDestinyTable.columns.map((col) => {
        return {
          value: col.id,
          label: col.name,
        };
      });
    }
  };

  const getColumnsByTableId = (tableId: number) => {
    if (!tableId) return [];

    const selectedTable = originData.find(
      (table) => table.id === Number(tableId)
    );

    return (
      selectedTable?.columns?.map((col) => ({
        value: col.id || col.name,
        label: col.name,
      })) || []
    );
  };

  console.log(values);

  return (
    <FieldArray name='columns'>
      {({ push, remove }) => (
        <div className='space-y-4'>
          {values.columns?.length === 0 ? (
            <div className='text-center py-10 text-gray-500'>
              <div className='text-5xl mb-4'>📋</div>
              <p>Nenhum mapeamento adicionado ainda</p>
              <p className='text-sm mt-2'>
                Clique no botão abaixo para adicionar seu primeiro mapeamento
              </p>
            </div>
          ) : (
            values.columns?.map((mapping, index: number) => (
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
                    <Field
                      as='select'
                      name={`columns.${index}.origin_table_id`}
                      className='w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    >
                      <option value=''>Selecionar</option>
                      {tableOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </Field>
                  </div>

                  <div>
                    <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                      Coluna Origem
                    </label>
                    <Field
                      as='select'
                      name={`columns.${index}.origin_column_id`}
                      disabled={!mapping.origin_table_id} // Desabilita se não tiver tabela selecionada
                      className='w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed'
                    >
                      <option value=''>
                        {mapping.origin_table_id
                          ? 'Selecionar'
                          : 'Selecione uma tabela primeiro'}
                      </option>
                      {getColumnsByTableId(mapping.origin_table_id).map(
                        (opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        )
                      )}
                    </Field>
                  </div>

                  <div>
                    <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                      Tabela Destino
                    </label>
                    <Field
                      as='select'
                      name={`columns.${index}.destiny_table_id`}
                      className='w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    >
                      {destinyData.map((option) => {
                        return (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        );
                      })}
                    </Field>
                  </div>

                  <div>
                    <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                      Coluna Destino
                    </label>
                    <Field
                      as='select'
                      name={`columns.${index}.destiny_column_id`}
                      className='w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'
                    >
                      <option value=''>Selecionar</option>
                      {getDestinyColumnsByTableId(
                        mapping.destiny_table_id
                      )?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Field>
                  </div>

                  <div>
                    <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                      Ações
                    </label>
                    <button
                      type='button'
                      onClick={() => {
                        if (window.confirm('Deseja remover este mapeamento?')) {
                          remove(index);
                        }
                      }}
                      className='w-full h-10 bg-red-100 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-200 hover:border-red-300 transition-colors flex items-center justify-center'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          <ConfirmButton
            type='button'
            onClick={() =>
              push({
                id: Date.now(),
                sourceTable: '',
                sourceColumn: '',
                destTable: '',
                destColumn: '',
                transformations: [],
              })
            }
            className='w-full justify-center hover:-translate-y-0.5 hover:shadow-lg transition-all'
            iconPosition='left'
            Icon={<Plus className='w-5 h-5' />}
            text='Adicionar Mapeamento'
          />
        </div>
      )}
    </FieldArray>
  );
}
