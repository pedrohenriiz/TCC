import Textfield from '../../../../components/Inputs/Textfield';
import type { FormProps } from '../types';

export default function TableConfigForm({
  formik,
  isLoading,
}: {
  formik: FormProps;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className='grid grid-cols-2 gap-4 mb-6'>
        <div className='space-y-2'>
          <div className='h-4 w-32 bg-gray-200 rounded skeleton-shimmer'></div>
          <div className='h-11 w-full bg-gray-200 rounded-lg skeleton-shimmer'></div>
        </div>

        <div className='space-y-2'>
          <div className='h-4 w-40 bg-gray-200 rounded skeleton-shimmer'></div>
          <div className='h-11 w-full bg-gray-200 rounded-lg skeleton-shimmer'></div>
        </div>
      </div>
    );
  }

  return (
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
  );
}
