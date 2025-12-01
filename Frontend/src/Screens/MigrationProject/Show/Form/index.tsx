import { Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Textfield from '../../../../components/Inputs/Textfield';
import Textarea from '../../../../components/Inputs/Textarea';
import ConfirmButton from '../../../../components/ConfirmButton';

export default function Form({ formik }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <form
      onSubmit={formik.handleSubmit}
      className='bg-white rounded-lg shadow-lg p-6'
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

      <div className='flex items-center justify-between mt-8 pt-6 '>
        <button
          type='button'
          onClick={() => navigate('/migration-projects')}
          className='px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition hover:cursor-pointer'
        >
          Cancelar
        </button>
        <ConfirmButton
          Icon={<Save className='w-5 h-5' />}
          iconPosition='left'
          disabled={formik.isSubmitting || !formik.isValid}
          text={
            formik.isSubmitting
              ? 'Salvando...'
              : id === 'new'
              ? 'Criar Projeto'
              : 'Salvar Alterações'
          }
        />
      </div>
    </form>
  );
}
