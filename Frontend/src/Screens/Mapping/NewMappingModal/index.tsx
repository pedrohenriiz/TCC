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

interface ColumnProps {
  id: number;
  origin_table_id: number;
  origin_column_id: number;
  destiny_table_id: number;
  destiny_column_id: number;
}

export interface FormValuesProps {
  id: string | number;
  mappingName: string;
  status: 'COMPLETE' | 'INCOMPLETE';
  columns?: {
    id: number;
    origin_table_id: number;
    origin_column_id: number;
    destiny_table_id: number;
    destiny_column_id: number;
    // transformations: never[];
  }[];
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

  console.log('destinyData', destinyData);

  console.log('data', data);

  // const transformationOptions = [
  //   { value: 'trim', label: '✂️ Trim - Remove espaços' },
  //   { value: 'uppercase', label: '🔤 Uppercase - Maiúsculas' },
  //   { value: 'lowercase', label: '🔡 Lowercase - Minúsculas' },
  //   { value: 'split', label: '✂️ Split - Dividir texto' },
  //   { value: 'concat', label: '🔗 Concatenar' },
  //   { value: 'formatNumber', label: '🔢 Formatar número' },
  //   { value: 'formatDate', label: '📅 Formatar data' },
  // ];

  const tableOptions = originData.map((item: OriginDataProps) => {
    return {
      id: item.id,
      name: item.name,
    };
  });

  // Schema de validação com Yup
  const validationSchema = Yup.object({
    mappingName: Yup.string()
      .required('Nome do mapeamento é obrigatório')
      .min(3, 'Nome deve ter pelo menos 3 caracteres'),
    status: Yup.string()
      .required('Status é obrigatório')
      .oneOf(['COMPLETE', 'INCOMPLETE'], 'Status inválido'),
    // mappings: Yup.array()
    //   .of(
    //     Yup.object({
    //       sourceTable: Yup.string().required('Tabela origem é obrigatória'),
    //       sourceColumn: Yup.string().required('Coluna origem é obrigatória'),
    //       destTable: Yup.string().required('Tabela destino é obrigatória'),
    //       destColumn: Yup.string().required('Coluna destino é obrigatória'),
    //       transformations: Yup.array().of(
    //         Yup.object({
    //           type: Yup.string().required(
    //             'Tipo de transformação é obrigatório'
    //           ),
    //         })
    //       ),
    //     }).nullable()
    //   )
    //   .nullable()
    //   .notRequired(),
  });

  const formattedInitialColumns = data?.columns?.map(
    (col: MappingColumnDataProps) => {
      return {
        id: col.id,
        origin_table_id: col.origin_table_id,
        origin_column_id: col.origin_column_id,
        destiny_table_id: col.destiny_table_id,
        destiny_column_id: col.destiny_column_id,
        transformations: [],
      };
    }
  );

  // Valores iniciais
  const initialValues = {
    id: data?.id || '',
    mappingName: data?.name || '',
    status: data?.status || 'INCOMPLETE',
    columns:
      data && data.columns && data.columns.length > 0
        ? formattedInitialColumns
        : [
            {
              id: '',
              origin_table_id: '',
              origin_column_id: '',
              destiny_table_id: '',
              destiny_column_id: '',
              transformations: [],
            },
          ],
  };

  const handleSubmit = (values: FormValuesProps) => {
    const formattedColumns = values.columns?.map((col) => {
      const data = {
        origin_table_id: col.origin_table_id,
        origin_column_id: col.origin_column_id,
        destiny_table_id: col.destiny_table_id,
        destiny_column_id: col.destiny_column_id,
      } as ColumnProps;

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

  // const getColumnsByTableId = (tableId: number) => {
  //   if (!tableId) return [];

  //   const selectedTable = originData.origin_tables.find(
  //     (table) => table.id === Number(tableId)
  //   );

  //   // Assumindo que suas tabelas têm um array de colunas
  //   // Ajuste conforme a estrutura real dos seus dados
  //   return (
  //     selectedTable?.columns?.map((col) => ({
  //       value: col.id || col.name,
  //       label: col.name,
  //     })) || []
  //   );
  // };

  // const getDestinyColumnsByTableId = (destinyTableId: number) => {
  //   if (!destinyTableId) {
  //     return [];
  //   }

  //   const selectedDestinyTable = destinyData.find(
  //     (table) => table.id === Number(destinyTableId)
  //   );

  //   return selectedDestinyTable.columns.map((col) => ({
  //     value: col.id,
  //     label: col.name,
  //   }));
  // };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      validateOnChange={false}
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
        console.log('values', values);

        return (
          <LargeModal
            title='Mapear colunas'
            isSubmitting={isSubmitting}
            isValid={isValid}
            onClose={() => handleClose()}
            onSubmit={formikSubmit}
          >
            <div className='flex-1 overflow-y-auto px-8 py-8'>
              {/* Nome do Mapeamento */}
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
                  tableOptions={tableOptions}
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
