import { Formik, Form, Field } from 'formik';
import { X } from 'lucide-react';
import { useSettingStore } from '../../../../store/useSettingStore';
import { useDataSettingsStore } from '../../../../store/useDataSettingStore';

interface AddConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddConfigModal({
  isOpen,
  onClose,
}: AddConfigModalProps) {
  const { addColumn, updateColumn, editing } = useSettingStore(
    (state) => state
  );

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/40 flex justify-center items-center z-50'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative'>
        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'
        >
          <X size={20} />
        </button>

        <h2 className='text-lg font-semibold mb-4 text-gray-800'>
          Adicionar nova configuração
        </h2>

        <Formik
          initialValues={{
            column: editing?.column || '',
            type: editing?.type || 'texto',
            value: editing?.value || '',
          }}
          validate={(values) => {
            const errors: Partial<typeof values> = {};
            if (!values.column)
              errors.column = 'O nome da coluna é obrigatório.';
            return errors;
          }}
          onSubmit={(values, { resetForm }) => {
            if (editing?.id) {
              updateColumn(editing.id, values);
            } else {
              addColumn(values);
            }

            resetForm();
            onClose();
          }}
        >
          {({ errors, touched }) => (
            <Form className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Nome da Coluna
                </label>
                <Field
                  name='column'
                  placeholder='Ex: company_id'
                  className='w-full border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
                />
                {errors.column && touched.column && (
                  <p className='text-red-500 text-xs mt-1'>{errors.column}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Tipo
                </label>
                <Field
                  as='select'
                  name='type'
                  className='w-full border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value='texto'>Texto</option>
                  <option value='número'>Número</option>
                  <option value='booleano'>Booleano</option>
                </Field>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Valor Padrão
                </label>
                <Field
                  name='value'
                  placeholder='Ex: 123 ou true'
                  className='w-full border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500'
                />
              </div>

              <div className='flex justify-end gap-2 pt-4'>
                <button
                  type='button'
                  onClick={onClose}
                  className='px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
                >
                  Salvar
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
