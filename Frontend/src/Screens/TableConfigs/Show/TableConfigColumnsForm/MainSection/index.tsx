import { Field } from 'formik';
import { Trash2 } from 'lucide-react';
import FieldError from '../FieldError';
import type { ColumnProps, FormProps } from '../../types';

interface MainSectionProps {
  index: number;
  formik: FormProps;
  col: ColumnProps;
  hasError: (value: string) => boolean;
  remove: (value: number) => void;
}

export default function MainSection({
  formik,
  index,
  col,
  hasError,
  remove,
}: MainSectionProps) {
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

  const requiresSize = (type: string) => {
    return ['VARCHAR', 'DECIMAL'].includes(type);
  };

  return (
    <div className='grid grid-cols-12 gap-3 items-start mb-4'>
      <div className='col-span-3'>
        <label className='block text-left text-xs font-medium text-gray-700 mb-1'>
          Nome <span className='text-red-500'>*</span>
        </label>
        <Field
          name={`columns.${index}.name`}
          placeholder='nome_coluna'
          className={`w-full px-4 py-3 bg-white text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            hasError(`columns.${index}.name`)
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300'
          }`}
        />
        <FieldError name={`columns.${index}.name`} formik={formik} />
      </div>

      <div className='col-span-2'>
        <label className='block text-left text-xs font-medium text-gray-700 mb-1'>
          Tipo <span className='text-red-500'>*</span>
        </label>
        <Field
          as='select'
          name={`columns.${index}.type`}
          className={`w-full px-4 py-3 bg-white text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            hasError(`columns.${index}.type`)
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300'
          }`}
        >
          <option value=''>Selecione...</option>
          {dataTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Field>
        <FieldError name={`columns.${index}.type`} formik={formik} />
      </div>

      <div className='col-span-2'>
        <label className='block text-left text-xs font-medium text-gray-700 mb-1'>
          Tamanho
          {requiresSize(col.type) && <span className='text-red-500'> *</span>}
        </label>
        <Field
          name={`columns.${index}.size`}
          placeholder='255'
          type='number'
          disabled={['TEXT', 'DATE', 'DATETIME', 'BOOLEAN'].includes(col.type)}
          className={`w-full px-4 py-3 bg-white text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
            hasError(`columns.${index}.size`)
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300'
          }`}
        />
        <FieldError name={`columns.${index}.size`} formik={formik} />
      </div>

      <div className='col-span-3 flex items-center gap-4 pt-5'>
        <label className='flex items-center gap-2 text-sm'>
          <Field
            type='checkbox'
            name={`columns.${index}.is_pk`}
            checked={formik.values.columns[index].is_pk}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              formik.setFieldValue(`columns.${index}.is_pk`, e.target.checked)
            }
            className='w-4 h-4 rounded text-blue-600 focus:ring-blue-500'
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
                e.target.checked,
              )
            }
            className='w-4 h-4 rounded text-blue-600 focus:ring-blue-500'
          />
          <span className='text-gray-700'>NULL</span>
        </label>
      </div>

      <div className='col-span-2 flex justify-end pt-5'>
        <button
          type='button'
          onClick={() => remove(index)}
          className='flex items-center gap-2 text-red-600 hover:text-red-800 text-sm hover:cursor-pointer'
          disabled={formik.values.columns.length === 1}
          title={
            formik.values.columns.length === 1
              ? 'A tabela deve ter pelo menos uma coluna'
              : 'Remover coluna'
          }
        >
          <Trash2 className='w-4 h-4' />
          Remover
        </button>
      </div>
    </div>
  );
}
