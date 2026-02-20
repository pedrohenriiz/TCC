import { useRef } from 'react';
import { Save } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import type { FormikProps } from 'formik';

import { useQuery } from '@tanstack/react-query';

import { useTableConfigCreate } from '../../../hooks/TableConfigs/useTableConfigCreate';
import { getUniqueTableConfig } from '../../../services/tableConfigs/getUniqueTableConfig';
import { useTableConfigUpdate } from '../../../hooks/TableConfigs/useTableConfigUpdate';
import CustomHeader from '../../../components/CustomHeader';

import TableConfigForm from './TableConfigForm';
import TableConfigColumnsForm from './TableConfigColumnsForm';
import type { ColumnProps } from './types';
import AddColumnsHeader from './AddColumnsHeader';
import { tableConfigValidationSchema } from './validationSchema';

interface OnSubmitFormProps {
  name: string;
  exhibition_name: string;
  columns: ColumnProps[];
}

export default function TableConfigsShow() {
  const navigate = useNavigate();
  const { id } = useParams();
  const create = useTableConfigCreate();
  const update = useTableConfigUpdate();

  const formikRef = useRef<FormikProps<OnSubmitFormProps>>(
    {} as FormikProps<OnSubmitFormProps>,
  );

  const { data, isLoading } = useQuery({
    queryKey: ['tableConfig', id],
    queryFn: () => getUniqueTableConfig(Number(id)),
    enabled: id !== 'new',
  });

  const mapApiToFormik = () => {
    const columns =
      data?.columns?.map((col: ColumnProps, index: number) => ({
        id: col.id || `col-${index}`,
        name: col.name,
        type: col.type,
        size: col.size || '',
        is_pk: col.is_pk || false,
        is_nullable: col.is_nullable === false ? false : true,
        foreign_table_id: col.foreign_table_id || '',
        foreign_column_id: col.foreign_column_id || '',
        id_generation_strategy: col.id_generation_strategy || 'keep',
        id_start_value: col.id_start_value ? Number(col.id_start_value) : 1,
      })) || [];

    return {
      name: data?.name || '',
      exhibition_name: data?.exhibition_name || '',
      columns,
    };
  };

  const initialValues = mapApiToFormik();

  async function onSubmit(values: OnSubmitFormProps) {
    const payload = values.columns.map((col) => ({
      name: col.name,
      type: col.type,
      size: col.size ? Number(col.size) : null,
      is_pk: col.is_pk || false,
      is_nullable: col.is_nullable !== undefined ? col.is_nullable : true,
      foreign_table_id: Number(col.foreign_table_id) || null,
      foreign_column_id: Number(col.foreign_column_id) || null,
      id_generation_strategy: col.id_generation_strategy || 'keep',
      id_start_value: col.id_start_value ? Number(col.id_start_value) : 1,
    }));

    const formattedData = {
      name: values.name,
      exhibition_name: values.exhibition_name,
      columns: payload,
    };

    try {
      if (id === 'new') {
        create.mutate(formattedData);
      } else {
        await update.mutateAsync({
          id: Number(id),
          data: formattedData,
        });
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <CustomHeader
        showBackButton
        title={id === 'new' ? 'Nova Tabela' : 'Editar Tabela'}
        subtitle='Configure a tabela de destino'
        handleGoBack={() => navigate('/tables-configs')}
        showConfirmButton
        buttonProps={{
          iconPosition: 'left',
          Icon: <Save className='w-5 h-5' />,
          text: id === 'new' ? 'Criar Tabela' : 'Atualizar Tabela',
          onClick: () => formikRef.current?.submitForm(),
        }}
      />

      <div className='max-w-6xl mx-auto'>
        <div className='bg-white rounded-lg shadow-lg p-6 mb-6 my-6'>
          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={tableConfigValidationSchema}
            validateOnBlur={true}
            onSubmit={onSubmit}
            innerRef={formikRef}
          >
            {(formik) => {
              return (
                <Form>
                  <TableConfigForm
                    formik={formik}
                    isLoading={isLoading || formik.isSubmitting}
                  />

                  {/* Colunas */}
                  <div className='bg-blue-50 rounded-lg p-4 mb-6'>
                    <AddColumnsHeader
                      isLoading={isLoading || formik.isSubmitting}
                    />

                    <TableConfigColumnsForm
                      formik={formik}
                      isLoading={isLoading || formik.isSubmitting}
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
