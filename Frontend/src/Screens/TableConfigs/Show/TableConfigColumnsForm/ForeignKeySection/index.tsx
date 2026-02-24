import { Field } from 'formik';
import { Link } from 'lucide-react';
import FieldError from '../FieldError';
import type { ColumnProps, FormProps, TableConfigProps } from '../../types';

interface ForeignKeySectionProps {
  index: number;
  col: ColumnProps;
  formik: FormProps;
  allTables: TableConfigProps[];
  currentTableId: string | undefined;
  hasError: (value: string) => boolean;
}

export default function ForeignKeySection({
  index,
  col,
  formik,
  allTables,
  currentTableId,
  hasError,
}: ForeignKeySectionProps) {
  const getColumnsForTable = (tableId: number) => {
    if (!allTables || !tableId) return [];
    const table = allTables.find(
      (t: { id: number }) => t.id === Number(tableId),
    );
    return table?.columns || [];
  };

  return (
    <div className='pt-4 border-t border-gray-200'>
      <div className='flex items-center gap-2 mb-3'>
        <Link size={16} className='text-blue-600' />
        <span className='text-sm font-medium text-gray-700'>
          Chave Estrangeira (opcional)
        </span>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='block text-left text-xs font-medium text-gray-700 mb-1'>
            Tabela Referenciada
          </label>
          <Field
            as='select'
            name={`columns.${index}.foreign_table_id`}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target?.value ? Number(e.target.value) : null;
              formik.setFieldValue(`columns.${index}.foreign_table_id`, value);
              formik.setFieldValue(`columns.${index}.foreign_column_id`, null);
            }}
            className={`w-full px-4 py-3 bg-white text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError(`columns.${index}.foreign_table_id`)
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
          >
            <option value=''>Nenhuma</option>
            {allTables
              ?.filter((t) => t.id !== Number(currentTableId))
              .map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name}
                </option>
              ))}
          </Field>
          <FieldError
            name={`columns.${index}.foreign_table_id`}
            formik={formik}
          />
        </div>
        <div>
          <label className='block text-left text-xs font-medium text-gray-700 mb-1'>
            Coluna Referenciada
          </label>
          <Field
            as='select'
            name={`columns.${index}.foreign_column_id`}
            disabled={!col.foreign_table_id}
            className={`w-full px-4 py-3 bg-white text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
              hasError(`columns.${index}.foreign_column_id`)
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
          >
            <option value=''>Selecione...</option>
            {col.foreign_table_id &&
              getColumnsForTable(col.foreign_table_id).map((foreignCol) => (
                <option key={foreignCol.id} value={foreignCol.id}>
                  {foreignCol.name} ({foreignCol.type})
                </option>
              ))}
          </Field>
          <FieldError
            name={`columns.${index}.foreign_column_id`}
            formik={formik}
          />
        </div>
      </div>
      {col.foreign_table_id && col.foreign_column_id && (
        <div className='mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
          <div className='flex items-center gap-2 text-xs text-blue-800'>
            <Link size={12} />
            <span>
              Esta coluna referencia{' '}
              <strong>
                {allTables?.find((t) => t.id === col.foreign_table_id)?.name}.
                {
                  getColumnsForTable(col.foreign_table_id).find(
                    (c) => c.id === col.foreign_column_id,
                  )?.name
                }
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
