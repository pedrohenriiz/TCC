import { Plus, Trash2, Link, Save } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmButton from '../../../components/ConfirmButton';
import Header from './Header';
import { Field, FieldArray, Form, Formik } from 'formik';
import { useTableConfigCreate } from '../../../hooks/TableConfigs/useTableConfigCreate';
import { useQuery } from '@tanstack/react-query';
import { getUniqueTableConfig } from '../../../services/tableConfigs/getUniqueTableConfig';
import { useTableConfigUpdate } from '../../../hooks/TableConfigs/useTableConfigUpdate';
import { useMemo } from 'react';

export default function TableConfigsShow() {
  const navigate = useNavigate();
  const { id } = useParams();
  const create = useTableConfigCreate();
  const update = useTableConfigUpdate();

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

  const { data, isLoading, error } = useQuery({
    queryKey: ['tableConfig', id],
    queryFn: () => getUniqueTableConfig(Number(id)),
    enabled: id !== 'new',
  });

  const mapApiToFormik = (apiData) => {
    if (!apiData)
      return {
        name: '',
        exhibition_name: '',
        columns: [],
        foreignKeys: [],
      };

    const columns =
      apiData.columns?.map((col, index) => ({
        id: col.id || `col-${index}`,
        name: col.name,
        type: col.type,
        length: col.size || '',
        isPK: col.is_pk || false,
        nullable: col.is_nullable ?? true,
      })) || [];

    const foreignKeys =
      apiData.columns
        ?.filter((col) => col.foreign_table_id)
        .map((col, index) => ({
          id: col.id || `fk-${index}`,
          column: col.name,
          referencedTable: col.foreign_table_id,
          referencedColumn: col.foreign_column_id || 'id',
        })) || [];

    return {
      name: apiData.name || '',
      exhibition_name: apiData.exhibition_name || '',
      columns,
      foreignKeys,
    };
  };

  const initialValues = useMemo(() => mapApiToFormik(data?.data), [data?.data]);

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
          <Header />

          {/* Formulário de Tabela */}
          <div className='border-2 border-dashed border-gray-300 rounded-lg p-6'>
            <Formik
              initialValues={initialValues}
              enableReinitialize
              onSubmit={async (values) => {
                const payload = values.columns.map((col, index) => {
                  const fk = values.foreignKeys.find(
                    (f) => f.column === col.name
                  );

                  return {
                    name: col.name,
                    type: col.type,
                    size: col.length ? Number(col.length) : undefined,
                    is_pk: col.isPK || false,
                    is_nullable:
                      col.nullable !== undefined ? col.nullable : true,
                    foreign_table_id: fk ? fk.referencedTable : undefined,
                    foreign_column_id: fk ? fk.referencedColumn : undefined,
                  };
                });

                const formattedData = {
                  name: values.name,
                  exhibition_name: values.exhibition_name,
                  columns: payload,
                };

                if (id === 'new') {
                  create.mutate(formattedData);
                } else {
                  await update.mutateAsync({
                    id: Number(id),
                    data: formattedData,
                  });
                }
              }}
            >
              {({ values, setFieldValue }) => {
                return (
                  <Form>
                    <div className='grid grid-cols-2 gap-4 mb-6'>
                      <div>
                        <label className='block text-sm font-medium mb-2'>
                          Nome da Tabela *
                        </label>
                        <Field
                          name='name'
                          placeholder='ex: cliente'
                          className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium mb-2'>
                          Nome de Exibição
                        </label>
                        <Field
                          name='exhibition_name'
                          placeholder='ex: Clientes'
                          className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                        />
                      </div>
                    </div>

                    <div className='bg-blue-50 rounded-lg p-4 mb-4'>
                      <h3 className='font-medium mb-3'>Colunas</h3>
                      <FieldArray name='columns'>
                        {({ push, remove }) => (
                          <>
                            {values.columns.map((col, index) => (
                              <div
                                key={col.id || index}
                                className='flex items-center gap-3 mb-2'
                              >
                                <Field
                                  name={`columns.${index}.name`}
                                  placeholder='Nome'
                                  className='px-3 py-2 border rounded'
                                />
                                <Field
                                  as='select'
                                  name={`columns.${index}.type`}
                                  className='px-3 py-2 border rounded'
                                >
                                  {dataTypes.map((type) => (
                                    <option key={type} value={type}>
                                      {type}
                                    </option>
                                  ))}
                                </Field>
                                <Field
                                  name={`columns.${index}.length`}
                                  placeholder='Tamanho'
                                  className='px-3 py-2 border rounded'
                                />
                                <label className='flex items-center gap-2'>
                                  <Field
                                    type='checkbox'
                                    name={`columns.${index}.isPK`}
                                  />
                                  <span className='text-sm'>PK</span>
                                </label>
                                <label className='flex items-center gap-2'>
                                  <Field
                                    type='checkbox'
                                    name={`columns.${index}.nullable`}
                                  />
                                  <span className='text-sm'>NULL</span>
                                </label>
                                <button
                                  type='button'
                                  onClick={() => remove(index)}
                                >
                                  <Trash2 className='w-4 h-4 text-red-600' />
                                </button>
                              </div>
                            ))}

                            <button
                              type='button'
                              onClick={() =>
                                push({
                                  id: Date.now(),
                                  name: '',
                                  type: 'VARCHAR',
                                  length: '',
                                  isPK: false,
                                  nullable: true,
                                })
                              }
                              className='flex items-center gap-2 px-4 py-2 mt-2 rounded-lg hover:bg-blue-700 bg-blue-500 text-white'
                            >
                              <Plus className='w-4 h-4' /> Adicionar coluna
                            </button>
                          </>
                        )}
                      </FieldArray>
                    </div>

                    <div className='mb-4'>
                      <div className='flex items-center justify-between mb-3'>
                        <h3 className='font-medium'>Chaves Estrangeiras</h3>
                        <button
                          type='button'
                          onClick={() =>
                            setFieldValue('foreignKeys', [
                              ...values.foreignKeys,
                              {
                                id: Date.now(),
                                column: '',
                                referencedTable: '',
                                referencedColumn: 'id',
                              },
                            ])
                          }
                          className='flex items-center gap-2 text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300'
                        >
                          <Link className='w-4 h-4' /> Adicionar FK
                        </button>
                      </div>

                      <FieldArray name='foreignKeys'>
                        {({ remove }) =>
                          values.foreignKeys.map((fk, index) => (
                            <div
                              key={fk.id || index}
                              className='flex items-center gap-3 mb-2'
                            >
                              <Field
                                as='select'
                                name={`foreignKeys.${index}.column`}
                                className='px-3 py-2 border rounded'
                              >
                                <option value=''>Selecione coluna</option>
                                {values.columns.map((col: any, i: number) => (
                                  <option key={i} value={col.name}>
                                    {col.name}
                                  </option>
                                ))}
                              </Field>
                              <span>→</span>
                              <Field
                                name={`foreignKeys.${index}.referencedTable`}
                                placeholder='Tabela referenciada'
                                className='px-3 py-2 border rounded flex-1'
                              />
                              <button
                                type='button'
                                onClick={() => remove(index)}
                              >
                                <Trash2 className='w-4 h-4 text-red-600' />
                              </button>
                            </div>
                          ))
                        }
                      </FieldArray>
                    </div>

                    <div className='flex items-center justify-between mt-6'>
                      <button
                        type='button'
                        onClick={() => navigate('/tables-config')}
                        className='px-6 py-3 border rounded-lg hover:bg-gray-50'
                      >
                        Cancelar
                      </button>

                      <ConfirmButton
                        type='submit'
                        iconPosition='left'
                        Icon={<Save className='w-5 h-5' />}
                        text={
                          id === 'new' ? 'Criar Tabela' : 'Atualizar Tabela'
                        }
                        disabled={!values.name}
                      />
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}
