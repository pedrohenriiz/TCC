import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { X } from 'lucide-react'; // Ícone de fechar

interface DataTypeFormProps {
  initialValues: {
    name: string;
    baseType: string;
    config?: Record<string, any>;
  };
  onSave: (values: any) => void;
  onClose: () => void;
  renderDynamicFields: (values: any, setFieldValue: any) => JSX.Element;
}

const AddDataTypeModal = ({
  initialValues,
  onSave,
  onClose,
  renderDynamicFields,
}: DataTypeFormProps) => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative'>
        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'
        >
          <X size={20} />
        </button>

        <h2 className='text-lg font-semibold mb-4'>Adicionar / Editar Tipo</h2>

        <Formik initialValues={initialValues} onSubmit={onSave}>
          {({ values, handleChange, setFieldValue, errors, touched }) => (
            <Form className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Nome do Tipo
                </label>
                <Field
                  type='text'
                  name='name'
                  placeholder='Ex: Número Monetário'
                  className='mt-1 w-full border rounded-md px-2 py-1'
                />
                {errors.name && touched.name && (
                  <p className='text-red-500 text-sm mt-1'>{errors.name}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Tipo Base
                </label>
                <Field
                  as='select'
                  name='baseType'
                  className='mt-1 w-full border rounded-md px-2 py-1'
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    handleChange(e);
                    setFieldValue('config', {}); // Resetar config
                  }}
                >
                  <option value=''>Selecione</option>
                  <option value='string'>string</option>
                  <option value='number'>number</option>
                  <option value='boolean'>boolean</option>
                  <option value='date'>date</option>
                </Field>
                {errors.baseType && touched.baseType && (
                  <p className='text-red-500 text-sm mt-1'>{errors.baseType}</p>
                )}
              </div>

              {values.baseType && (
                <div className='pt-3 border-t mt-3 space-y-2'>
                  <h3 className='font-medium text-gray-700'>
                    Configurações do tipo
                  </h3>
                  {renderDynamicFields(values, setFieldValue)}
                </div>
              )}

              <div className='flex justify-end gap-2 pt-4'>
                <button
                  type='button'
                  onClick={onClose}
                  className='px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100'
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
};

export default AddDataTypeModal;
