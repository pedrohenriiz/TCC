import { Key } from 'lucide-react';
import { type SourceTable } from '../../../../../../store/useSourceTableStore';
import Textfield from '../../../../../../components/Inputs/Textfield';
import HelperText from '../../../../../../components/Inputs/HelperText';

interface EditTableFormProps {
  table: SourceTable;
  formik: any;
}

export default function EditTableForm({ table, formik }: EditTableFormProps) {
  return (
    <>
      <Textfield
        label='Nome da Tabela'
        name='name'
        placeholder='Digite o nome da tabela'
        helpText='Nome que identificará esta tabela no sistema'
        required
        formik={formik}
      />

      <div>
        <label
          htmlFor='primaryKey'
          className='block text-sm font-medium text-gray-700 mb-2 text-left'
        >
          Coluna de ID Primário (Primary Key){' '}
          <span className='text-red-500'>*</span>
        </label>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <Key className='h-5 w-5 text-amber-600' />
          </div>
          <select
            id='primaryKey'
            name='primaryKey'
            value={formik.values.primaryKey}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
              formik.touched.primaryKey && formik.errors.primaryKey
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          >
            <option value=''>Selecione a coluna</option>
            {table.columns.map((col) => (
              <option key={col.id} value={col.name}>
                {col.name} ({col.type})
              </option>
            ))}
          </select>
        </div>
        {formik.touched.primaryKey && formik.errors.primaryKey && (
          <p className='mt-1.5 text-sm text-red-600'>
            {formik.errors.primaryKey}
          </p>
        )}
        <HelperText text='Coluna que identifica unicamente cada registro' />
      </div>
    </>
  );
}
