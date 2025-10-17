// components/Form.tsx
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useMigrationProjectStore from '../../../../store/useMigrationProjectStore';
import { Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import Textfield from '../../../../components/Inputs/Textfield';
import Textarea from '../../../../components/Inputs/Textarea';
import { useToastStore } from '../../../../store/useToastStore';

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .required('Nome do projeto é obrigatório'),
  description: Yup.string()
    .trim()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres')
    .required('Descrição é obrigatória'),
});

export default function Form() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addProject, updateProject, getProjectById } =
    useMigrationProjectStore();
  const { success } = useToastStore();

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
    },
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      if (id === 'new') {
        const newProject = addProject(values);
        success('Projeto de migração criado com sucesso!');
        navigate(`/migration-project/${newProject.id}/source-tables`);
      } else {
        updateProject(parseInt(id!), values);
        success('Projeto atualizado com sucesso!');
        navigate(`/migration-project/${id}`);
      }

      setSubmitting(false);
    },
  });

  useEffect(() => {
    if (id && id !== 'new') {
      const project = getProjectById(parseInt(id));
      if (project) {
        formik.setValues({
          name: project.name,
          description: project.description,
        });
      }
    }
  }, [id]);

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

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <h3 className='font-semibold text-blue-900 mb-2'>
            📝 Próximos Passos
          </h3>
          <p className='text-sm text-blue-800'>
            Após criar o projeto, você poderá:
          </p>
          <ul className='mt-2 text-sm text-blue-800 space-y-1 list-disc list-inside'>
            <li>Fazer upload de arquivos Excel com os dados de origem</li>
            <li>Configurar manualmente as tabelas de origem</li>
            <li>Definir o mapeamento entre origem e destino</li>
            <li>Executar a migração dos dados</li>
          </ul>
        </div>
      </div>

      <div className='flex items-center justify-between mt-8 pt-6 border-t'>
        <button
          type='button'
          onClick={() => navigate('/migration-projects')}
          className='px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition'
        >
          Cancelar
        </button>
        <button
          type='submit'
          disabled={formik.isSubmitting || !formik.isValid}
          className='flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold transition disabled:bg-gray-400'
        >
          <Save className='w-5 h-5' />
          {formik.isSubmitting
            ? 'Salvando...'
            : id === 'new'
            ? 'Criar Projeto'
            : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  );
}
