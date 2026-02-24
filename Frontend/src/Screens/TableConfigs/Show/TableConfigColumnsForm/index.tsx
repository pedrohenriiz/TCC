import { useQuery } from '@tanstack/react-query';
import { FieldArray } from 'formik';
import { AlertCircle } from 'lucide-react';
import { getTableConfigs } from '../../../../services/tableConfigs/getTableConfigs';
import { useParams } from 'react-router-dom';
import type { FormProps } from '../types';
import PrimaryKeySection from './PrimaryKeySection';
import ForeignKeySection from './ForeignKeySection';
import MainSection from './MainSection';
import SkeletonLoading from '../SkeletonLoading';

export default function TableConfigColumnsForm({
  formik,
  isLoading,
}: {
  formik: FormProps;
  isLoading: boolean;
}) {
  const { id } = useParams();

  const { data: allTables } = useQuery({
    queryKey: ['allTableConfigs'],
    queryFn: () => getTableConfigs({ params: { with_columns: true } }),
  });

  if (isLoading) {
    return <SkeletonLoading />;
  }

  const hasError = (fieldName: string) => {
    if (formik.submitCount === 0) return false;

    const parts = fieldName.split('.');

    let errorValue;

    for (const part of parts) {
      if (errorValue) {
        errorValue = errorValue[part];
      }
    }

    return !!errorValue;
  };

  return (
    <FieldArray name='columns'>
      {({ remove }) => (
        <div className='space-y-4'>
          {/* Erro global de colunas */}
          {formik.submitCount > 0 &&
            typeof formik.errors.columns === 'string' && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
                <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                <div className='text-sm text-red-800'>
                  {formik.errors.columns}
                </div>
              </div>
            )}

          {formik.values.columns.map((col, index) => {
            const columnErrors = formik.errors.columns?.[index];
            const hasColumnError =
              formik.submitCount > 0 &&
              columnErrors &&
              typeof columnErrors === 'object';

            const isPK = formik.values.columns[index].is_pk;

            return (
              <div
                key={col.id || index}
                className={`border rounded-lg p-4 bg-white ${
                  hasColumnError
                    ? 'border-red-300 ring-2 ring-red-200'
                    : 'border-gray-200'
                }`}
              >
                <MainSection
                  col={col}
                  formik={formik}
                  hasError={hasError}
                  index={index}
                  remove={remove}
                />

                {isPK && <PrimaryKeySection formik={formik} index={index} />}

                <ForeignKeySection
                  allTables={allTables}
                  col={col}
                  currentTableId={id}
                  formik={formik}
                  hasError={hasError}
                  index={index}
                />
              </div>
            );
          })}
        </div>
      )}
    </FieldArray>
  );
}
