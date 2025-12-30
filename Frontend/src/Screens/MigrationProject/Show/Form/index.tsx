import Textfield from '../../../../components/Inputs/Textfield';
import Textarea from '../../../../components/Inputs/Textarea';
import type { MigrationProjectFormProps } from '../../types';

export default function Form({
  formik,
}: {
  formik: MigrationProjectFormProps;
}) {
  return (
    <form
      onSubmit={formik.handleSubmit}
      className='bg-white rounded-lg shadow-lg p-6 mt-6'
    >
      <div className='space-y-6'>
        <Textfield
          label='Nome do Projeto'
          name='name'
          placeholder='Ex: Migração Cliente ABC'
          helpText='Escolha um nome descritivo para identificar facilmente este projeto'
          required
          formik={formik}
        />

        <Textarea
          label='Descrição'
          name='description'
          placeholder='Ex: Migração do sistema legado...'
          helpText='Descreva o objetivo e escopo desta migração'
          required
          formik={formik}
        />
      </div>
    </form>
  );
}
