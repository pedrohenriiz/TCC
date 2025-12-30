import { useQuery } from '@tanstack/react-query';
import { Field, FieldArray } from 'formik';
import { Link, Trash2 } from 'lucide-react';
import { getTableConfigs } from '../../../../services/tableConfigs/getTableConfigs';
import { useParams } from 'react-router-dom';
import type { FormProps } from '../types';

export default function TableConfigColumnsForm({
  formik,
  isLoading,
}: {
  formik: FormProps;
  isLoading: boolean;
}) {
  const { id } = useParams();

  // Busca todas as tabelas para popular o select de FK
  const { data: allTables } = useQuery({
    queryKey: ['allTableConfigs'],
    queryFn: () => getTableConfigs({ params: { with_columns: true } }),
  });

  if (isLoading) {
    return (
      <div className='border border-gray-200 rounded-lg p-4 bg-white'>
        <div className='grid grid-cols-12 gap-3 items-center mb-4'>
          <div className='col-span-3 space-y-2'>
            <div className='h-3 w-20 rounded skeleton-shimmer' />
            <div className='h-10 rounded-lg skeleton-shimmer' />
          </div>

          <div className='col-span-2 space-y-2'>
            <div className='h-3 w-16 rounded skeleton-shimmer' />
            <div className='h-10 rounded-lg skeleton-shimmer' />
          </div>

          <div className='col-span-2 space-y-2'>
            <div className='h-3 w-20 rounded skeleton-shimmer' />
            <div className='h-10 rounded-lg skeleton-shimmer' />
          </div>

          <div className='col-span-3 flex gap-4 pt-5'>
            <div className='h-5 w-14 rounded skeleton-shimmer' />
            <div className='h-5 w-14 rounded skeleton-shimmer' />
          </div>

          <div className='col-span-2 flex justify-end pt-5'>
            <div className='h-5 w-20 rounded skeleton-shimmer' />
          </div>
        </div>

        <div className='pt-4 border-t border-gray-200 space-y-3'>
          <div className='h-4 w-48 rounded skeleton-shimmer' />

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <div className='h-3 w-32 rounded skeleton-shimmer' />
              <div className='h-10 rounded-lg skeleton-shimmer' />
            </div>
            <div className='space-y-2'>
              <div className='h-3 w-32 rounded skeleton-shimmer' />
              <div className='h-10 rounded-lg skeleton-shimmer' />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dataTypes = [
    'VARCHAR',
    'INT',
    'BIGINT',
    'TEXT',
    'DATE',
    'DATETIME',
    'BOOLEAN',
    'DECIMAL',
    'FLOAT',
  ];

  const getColumnsForTable = (tableId: number) => {
    if (!allTables || !tableId) return [];
    const table = allTables.find(
      (t: { id: number }) => t.id === Number(tableId)
    );
    return table?.columns || [];
  };

  return (
    <FieldArray name='columns'>
      {({ remove }) => (
        <div className='space-y-4'>
          {formik.values.columns.map((col, index) => (
            <div
              key={col.id || index}
              className='border border-gray-200 rounded-lg p-4 bg-white'
            >
              <div className='grid grid-cols-12 gap-3 items-center mb-4'>
                <div className='col-span-3'>
                  <label className='block text-xs font-medium text-gray-700 mb-1'>
                    Nome
                  </label>
                  <Field
                    name={`columns.${index}.name`}
                    placeholder='nome_coluna'
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div className='col-span-2'>
                  <label className='block text-xs font-medium text-gray-700 mb-1'>
                    Tipo
                  </label>
                  <Field
                    as='select'
                    name={`columns.${index}.type`}
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    {dataTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Field>
                </div>

                <div className='col-span-2'>
                  <label className='block text-xs font-medium text-gray-700 mb-1'>
                    Tamanho
                  </label>
                  <Field
                    name={`columns.${index}.size`}
                    placeholder='255'
                    type='number'
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                <div className='col-span-3 flex items-center gap-4 pt-5'>
                  <label className='flex items-center gap-2 text-sm'>
                    <Field
                      type='checkbox'
                      name={`columns.${index}.is_pk`}
                      checked={formik.values.columns[index].is_pk}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        formik.setFieldValue(
                          `columns.${index}.is_pk`,
                          e.target.checked
                        )
                      }
                      className='rounded text-blue-600 focus:ring-blue-500'
                    />
                    <span className='text-gray-700'>PK</span>
                  </label>

                  <label className='flex items-center gap-2 text-sm'>
                    <Field
                      type='checkbox'
                      name={`columns.${index}.is_nullable`}
                      checked={formik.values.columns[index].is_nullable}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        formik.setFieldValue(
                          `columns.${index}.is_nullable`,
                          e.target.checked
                        )
                      }
                      className='rounded text-blue-600 focus:ring-blue-500'
                    />
                    <span className='text-gray-700'>NULL</span>
                  </label>
                </div>

                <div className='col-span-2 flex justify-end pt-5'>
                  <button
                    type='button'
                    onClick={() => remove(index)}
                    className='flex items-center gap-2 text-red-600 hover:text-red-800 text-sm'
                  >
                    <Trash2 className='w-4 h-4' />
                    Remover
                  </button>
                </div>
              </div>

              {/* Linha 2: Foreign Key */}
              <div className='pt-4 border-t border-gray-200'>
                <div className='flex items-center gap-2 mb-3'>
                  <Link size={16} className='text-blue-600' />
                  <span className='text-sm font-medium text-gray-700'>
                    Chave Estrangeira (opcional)
                  </span>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>
                      Tabela Referenciada
                    </label>
                    <Field
                      as='select'
                      name={`columns.${index}.foreign_table_id`}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target?.value
                          ? Number(e.target.value)
                          : null;
                        formik.setFieldValue(
                          `columns.${index}.foreign_table_id`,
                          value
                        );
                        formik.setFieldValue(
                          `columns.${index}.foreign_column_id`,
                          null
                        );
                      }}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      <option value=''>Nenhuma</option>
                      {allTables
                        ?.filter((t) => t.id !== Number(id))
                        .map((table) => (
                          <option key={table.id} value={table.id}>
                            {table.name}
                          </option>
                        ))}
                    </Field>
                  </div>

                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>
                      Coluna Referenciada
                    </label>
                    <Field
                      as='select'
                      name={`columns.${index}.foreign_column_id`}
                      disabled={!col.foreign_table_id}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed'
                    >
                      <option value=''>Selecione...</option>
                      {col.foreign_table_id &&
                        getColumnsForTable(col.foreign_table_id).map(
                          (foreignCol) => (
                            <option key={foreignCol.id} value={foreignCol.id}>
                              {foreignCol.name} ({foreignCol.type})
                            </option>
                          )
                        )}
                    </Field>
                  </div>
                </div>

                {/* Preview da FK */}
                {col.foreign_table_id && col.foreign_column_id && (
                  <div className='mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                    <div className='flex items-center gap-2 text-xs text-blue-800'>
                      <Link size={12} />
                      <span>
                        Esta coluna referencia{' '}
                        <strong>
                          {
                            allTables?.find(
                              (t) => t.id === col.foreign_table_id
                            )?.name
                          }
                          .
                          {
                            getColumnsForTable(col.foreign_table_id).find(
                              (c) => c.id === col.foreign_column_id
                            )?.name
                          }
                        </strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </FieldArray>
  );
}
