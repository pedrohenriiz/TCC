import { Plus, Trash2, Link, Save } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmButton from '../../../components/ConfirmButton';
import { Field, FieldArray, Form, Formik } from 'formik';
import { useTableConfigCreate } from '../../../hooks/TableConfigs/useTableConfigCreate';
import { useQuery } from '@tanstack/react-query';
import { getUniqueTableConfig } from '../../../services/tableConfigs/getUniqueTableConfig';
import { useTableConfigUpdate } from '../../../hooks/TableConfigs/useTableConfigUpdate';
import { useMemo } from 'react';
import Textfield from '../../../components/Inputs/Textfield';
import CustomHeader from '../../../components/CustomHeader';
import { getTableConfigs } from '../../../services/tableConfigs/getTableConfigs';

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

  // Busca todas as tabelas para popular o select de FK
  const { data: allTables } = useQuery({
    queryKey: ['allTableConfigs'],
    queryFn: () => getTableConfigs({ params: { with_columns: true } }), // with_columns=true
  });

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
      };

    const columns =
      apiData.columns?.map((col, index) => ({
        id: col.id || `col-${index}`,
        name: col.name,
        type: col.type,
        length: col.size || '',
        isPK: col.is_pk || false,
        nullable: col.is_nullable ?? true,
        foreign_table_id: col.foreign_table_id || null,
        foreign_column_id: col.foreign_column_id || null,
      })) || [];

    return {
      name: apiData.name || '',
      exhibition_name: apiData.exhibition_name || '',
      columns,
    };
  };

  const initialValues = useMemo(() => mapApiToFormik(data), [data]);

  async function onSubmit(values) {
    const payload = values.columns.map((col) => ({
      name: col.name,
      type: col.type,
      size: col.length ? Number(col.length) : undefined,
      is_pk: col.isPK || false,
      is_nullable: col.nullable !== undefined ? col.nullable : true,
      foreign_table_id: Number(col.foreign_table_id) || undefined,
      foreign_column_id: Number(col.foreign_column_id) || undefined,
    }));

    const formattedData = {
      name: values.name,
      exhibition_name: values.exhibition_name,
      columns: payload,
    };

    if (id === 'new') {
      create.mutate(formattedData);
    } else {
      console.log(formattedData);

      await update.mutateAsync({
        id: Number(id),
        data: formattedData,
      });
    }
  }

  const getColumnsForTable = (tableId) => {
    if (!allTables || !tableId) return [];
    const table = allTables.find((t) => t.id === Number(tableId));
    return table?.columns || [];
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <CustomHeader
        showBackButton
        title={id === 'new' ? 'Nova Tabela' : 'Editar Tabela'}
        subtitle='Configure a tabela de destino'
        handleGoBack={() => navigate('/tables-configs')}
      />

      <div className='max-w-6xl mx-auto'>
        <div className='bg-white rounded-lg shadow-lg p-6 mb-6 my-6'>
          <Formik
            initialValues={initialValues}
            enableReinitialize
            onSubmit={onSubmit}
          >
            {(formik) => {
              return (
                <Form>
                  {/* Informações Básicas */}
                  <div className='grid grid-cols-2 gap-4 mb-6'>
                    <Textfield
                      formik={formik}
                      name='name'
                      placeholder='customers'
                      label='Nome da tabela'
                      required
                    />

                    <Textfield
                      formik={formik}
                      name='exhibition_name'
                      placeholder='Cliente'
                      label='Nome de exibição'
                      required
                    />
                  </div>

                  {/* Colunas */}
                  <div className='bg-blue-50 rounded-lg p-4 mb-6'>
                    <div className='flex items-center justify-between mb-4'>
                      <h3 className='font-semibold text-gray-900'>Colunas</h3>
                      <FieldArray name='columns'>
                        {({ push }) => (
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
                                foreign_table_id: null,
                                foreign_column_id: null,
                              })
                            }
                            className='flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-700 bg-blue-600 text-white text-sm'
                          >
                            <Plus className='w-4 h-4' /> Adicionar coluna
                          </button>
                        )}
                      </FieldArray>
                    </div>

                    <FieldArray name='columns'>
                      {({ remove }) => (
                        <div className='space-y-4'>
                          {formik.values.columns.map((col, index) => (
                            <div
                              key={col.id || index}
                              className='border border-gray-200 rounded-lg p-4 bg-white'
                            >
                              {/* Linha 1: Informações Básicas da Coluna */}
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
                                    name={`columns.${index}.length`}
                                    placeholder='255'
                                    type='number'
                                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                  />
                                </div>

                                <div className='col-span-3 flex items-center gap-4 pt-5'>
                                  <label className='flex items-center gap-2 text-sm'>
                                    <Field
                                      type='checkbox'
                                      name={`columns.${index}.isPK`}
                                      className='rounded text-blue-600 focus:ring-blue-500'
                                    />
                                    <span className='text-gray-700'>PK</span>
                                  </label>
                                  <label className='flex items-center gap-2 text-sm'>
                                    <Field
                                      type='checkbox'
                                      name={`columns.${index}.nullable`}
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
                                      onChange={(e) => {
                                        const value = e.target.value
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
                                          <option
                                            key={table.id}
                                            value={table.id}
                                          >
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
                                        getColumnsForTable(
                                          col.foreign_table_id
                                        ).map((foreignCol) => (
                                          <option
                                            key={foreignCol.id}
                                            value={foreignCol.id}
                                          >
                                            {foreignCol.name} ({foreignCol.type}
                                            )
                                          </option>
                                        ))}
                                    </Field>
                                  </div>
                                </div>

                                {/* Preview da FK */}
                                {col.foreign_table_id &&
                                  col.foreign_column_id && (
                                    <div className='mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                                      <div className='flex items-center gap-2 text-xs text-blue-800'>
                                        <Link size={12} />
                                        <span>
                                          Esta coluna referencia{' '}
                                          <strong>
                                            {
                                              allTables?.find(
                                                (t) =>
                                                  t.id === col.foreign_table_id
                                              )?.name
                                            }
                                            .
                                            {
                                              getColumnsForTable(
                                                col.foreign_table_id
                                              ).find(
                                                (c) =>
                                                  c.id === col.foreign_column_id
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
                  </div>

                  {/* Botões */}
                  <div className='flex items-center justify-between mt-6'>
                    <button
                      type='button'
                      onClick={() => navigate('/tables-configs')}
                      className='px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700'
                    >
                      Cancelar
                    </button>

                    <ConfirmButton
                      type='submit'
                      iconPosition='left'
                      Icon={<Save className='w-5 h-5' />}
                      text={id === 'new' ? 'Criar Tabela' : 'Atualizar Tabela'}
                      disabled={!formik.values.name}
                    />
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
