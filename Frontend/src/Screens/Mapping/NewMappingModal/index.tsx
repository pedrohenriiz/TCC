import { Formik } from 'formik';
import * as Yup from 'yup';
import LargeModal from '../../../components/LargeModal';
import { useMigrationProjectMappingCreate } from '../../../hooks/migrationProjectMappings/useMigrationProjectMappingCreate';
import { useMigrationProjectMappingUpdate } from '../../../hooks/migrationProjectMappings/useMigrationProjectMappingUpdate';
import Textfield from '../../../components/Inputs/Textfield';
import Select from '../../../components/Inputs/Select';
import type { MappingColumnDataProps, MappingDataProps } from '../types';
import MappingForm from './Form';

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

interface MappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  originData: OriginDataProps[];
  migrationProjectId: string;
  destinyData: DestinyDataProps[];
  data: MappingDataProps | undefined;
}

interface TransformationProps {
  id?: number;
  transformation_type_id: number;
  order: number;
  param_values?: {
    param_definition_id: number;
    value: string;
  }[];
}

interface ColumnProps {
  id?: number;
  origin_table_id: number;
  origin_column_id: number;
  destiny_table_id: number;
  destiny_column_id: number;
  transformations?: TransformationProps[];
}

export interface FormValuesProps {
  id: string | number;
  mappingName: string;
  status: 'COMPLETE' | 'INCOMPLETE';
  columns?: ColumnProps[];
}

export default function MappingModal({
  isOpen,
  onClose,
  originData,
  migrationProjectId,
  destinyData,
  data,
}: MappingModalProps) {
  const create = useMigrationProjectMappingCreate();
  const update = useMigrationProjectMappingUpdate();

  // Schema de validação com Yup
  const validationSchema = Yup.object({
    mappingName: Yup.string()
      .required('Nome do mapeamento é obrigatório')
      .min(3, 'Nome deve ter pelo menos 3 caracteres'),
    status: Yup.string()
      .required('Status é obrigatório')
      .oneOf(['COMPLETE', 'INCOMPLETE'], 'Status inválido'),
    columns: Yup.array().of(
      Yup.object().shape({
        transformations: Yup.array().test(
          'unique-orders',
          'Há ordens duplicadas nas transformações',
          function (transformations) {
            if (!transformations || transformations.length === 0) return true;

            const orders = transformations
              .map((t: any) => t.order)
              .filter(
                (order: any) =>
                  order !== '' && order !== null && order !== undefined
              );

            const uniqueOrders = new Set(orders);
            return orders.length === uniqueOrders.size;
          }
        ),
      })
    ),
  });

  const formattedInitialColumns = data?.columns?.map(
    (col: MappingColumnDataProps) => {
      return {
        id: col.id,
        origin_table_id: col.origin_table_id,
        origin_column_id: col.origin_column_id,
        destiny_table_id: col.destiny_table_id,
        destiny_column_id: col.destiny_column_id,
        transformations:
          col.transformations?.map((trans: any) => ({
            id: trans.id,
            transformation_type_id: trans.transformation_type_id,
            order: trans.order,
            param_values:
              trans.param_values?.map((param: any) => ({
                id: param.id,
                param_definition_id: param.param_definition_id,
                value: param.value,
              })) || [],
          })) || [],
      };
    }
  );

  // Valores iniciais
  const initialValues: FormValuesProps = {
    id: data?.id || '',
    mappingName: data?.name || '',
    status: data?.status || 'INCOMPLETE',
    columns:
      data && data.columns && data.columns.length > 0
        ? formattedInitialColumns
        : [
            {
              origin_table_id: 0,
              origin_column_id: 0,
              destiny_table_id: 0,
              destiny_column_id: 0,
              transformations: [],
            },
          ],
  };

  const handleSubmit = (values: FormValuesProps) => {
    const formattedColumns = values.columns?.map((col) => {
      const data: ColumnProps = {
        origin_table_id: col.origin_table_id,
        origin_column_id: col.origin_column_id,
        destiny_table_id: col.destiny_table_id,
        destiny_column_id: col.destiny_column_id,
        transformations:
          col.transformations
            ?.filter(
              (trans) =>
                trans.transformation_type_id &&
                trans.transformation_type_id !== ''
            ) // ✨ FILTRAR vazios
            ?.map((trans) => ({
              id: trans.id,
              transformation_type_id: Number(trans.transformation_type_id),
              order: Number(trans.order),
              param_values:
                trans.param_values?.map((param) => ({
                  id: param.id,
                  param_definition_id: Number(param.param_definition_id),
                  value: String(param.value),
                })) || [],
            })) || [],
      };

      if (col.id) {
        data.id = col.id;
      }

      return data;
    });

    if (values.id) {
      update.mutate({
        migrationProjectId: Number(migrationProjectId),
        id: Number(values.id),
        data: {
          id: Number(values.id),
          name: values.mappingName,
          migration_project_id: Number(migrationProjectId),
          status: values.status,
          columns: formattedColumns || [],
        },
      });
    } else {
      create.mutate({
        migrationProjectId,
        requestData: {
          name: values.mappingName,
          migration_project_id: Number(migrationProjectId),
          status: values.status,
          columns: formattedColumns,
        },
      });
    }

    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  const hasAnyDuplicateOrders = (values: FormValuesProps) => {
    if (!values.columns) return false;

    return values.columns.some((column) => {
      if (!column.transformations || column.transformations.length === 0)
        return false;

      const orders = column.transformations
        .map((t) => t.order)
        .filter(
          (order) => order !== '' && order !== null && order !== undefined
        );

      const uniqueOrders = new Set(orders);
      return orders.length !== uniqueOrders.size;
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      validateOnBlur={false}
      enableReinitialize
    >
      {({
        values,
        errors,
        touched,
        isSubmitting,
        isValid,
        handleChange,
        handleBlur,
        handleSubmit: formikSubmit,
      }) => {
        const hasDuplicates = hasAnyDuplicateOrders(values);
        return (
          <LargeModal
            title='Mapear colunas'
            isSubmitting={isSubmitting}
            isValid={isValid && !hasDuplicates}
            onClose={() => handleClose()}
            onSubmit={formikSubmit}
          >
            <div className='flex-1 overflow-y-auto px-8 py-8'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
                <Textfield
                  formik={{
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                  }}
                  label='Nome do Mapeamento'
                  name='mappingName'
                  placeholder='Clientes para customers'
                  required
                />

                <Select
                  formik={{ values, errors, touched, handleChange, handleBlur }}
                  label='Status'
                  name='status'
                  options={[
                    {
                      value: 'INCOMPLETE',
                      label: 'Incompleto',
                    },
                    {
                      value: 'COMPLETE',
                      label: 'Completo',
                    },
                  ]}
                  required
                />
              </div>

              {/* Mapeamentos */}
              <div>
                <div className='flex items-center gap-2 mb-4'>
                  <span className='text-lg'>🔗</span>
                  <h2 className='text-base font-semibold text-gray-700'>
                    Mapeamento de Colunas
                  </h2>
                </div>

                <MappingForm
                  destinyData={destinyData}
                  originData={originData}
                  values={values}
                />
              </div>
            </div>
          </LargeModal>
        );
      }}
    </Formik>
  );
}
