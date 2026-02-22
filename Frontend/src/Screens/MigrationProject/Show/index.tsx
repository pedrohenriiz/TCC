import * as Yup from 'yup';

import Form from './Form';
import Table from './Table';
import { CheckCircle2, Plus, Settings } from 'lucide-react';
import ConfirmButton from '../../../components/ConfirmButton';
import useSourceTablesStore, {
  type SourceTable,
} from '../../../store/useSourceTableStore';
import { useFormik } from 'formik';
import { useQuery } from '@tanstack/react-query';
import { getUniqueMigrationProject } from '../../../services/migrationProjects/getUniqueMigrationProject';
import { useNavigate, useParams } from 'react-router-dom';
import { useMigrationProjectCreate } from '../../../hooks/MigrationProjects/useMigrationProjectCreate';
import { useMigrationProjectUpdate } from '../../../hooks/MigrationProjects/useMigrationProjectUpdate';
import PagetTitle from '../../../components/PageTitle';
import CustomHeader from '../../../components/CustomHeader';
import useSetOriginTables from './hooks/useSetOriginTables';

interface FormattedDataProps {
  name: string;
  description: string;
  origin_tables: SourceTable[];
}

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .required('Nome do projeto é obrigatório'),
  description: Yup.string()
    .trim()
    .min(10, 'Descrição deve ter no mínimo 10 caracteres'),
});

export default function ProjectForm() {
  const { id } = useParams<{ id: string }>();
  const create = useMigrationProjectCreate();
  const update = useMigrationProjectUpdate();
  const navigate = useNavigate();

  const { sourceTables } = useSourceTablesStore();

  const { data } = useQuery({
    queryKey: ['migrationProject', id],
    queryFn: () => getUniqueMigrationProject(Number(id)),
    enabled: id !== 'new',
  });

  const formik = useFormik({
    initialValues: {
      name: data?.name || '',
      description: data?.description || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const formattedData: FormattedDataProps = {
        name: values.name,
        description: values.description,
        origin_tables: [],
      };

      if (id === 'new') {
        if (sourceTables) {
          formattedData.origin_tables = sourceTables;
        }
        create.mutate(formattedData);
      } else {
        await update.mutateAsync({
          id: Number(id),
          data: formattedData,
        });
      }
    },
  });

  useSetOriginTables({
    data,
    id,
  });

  const parentHandleFormSubmit = () => {
    formik.handleSubmit();
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <PagetTitle title='Migrare - Projetos de Migração' />

      <CustomHeader
        title={id === 'new' ? 'Novo Projeto de Migração' : 'Editar Projeto'}
        handleGoBack={() => navigate('/migration-projects')}
        showBackButton
        subtitle='Configure o projeto de migração'
        buttonProps={{
          Icon: <Plus className='w-4 h-4' />,
          iconPosition: 'left',
          onClick: () => {
            formik.handleSubmit();
          },
          text: id === 'new' ? 'Criar Projeto' : 'Salvar Alterações',
          type: 'submit',
        }}
        showConfirmButton
      />

      <div className='max-w-6xl mx-auto'>
        <Form formik={formik} />

        {/* Card de Próximos Passos */}
        <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6 mt-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-blue-600 rounded-lg'>
              <CheckCircle2 className='w-5 h-5 text-white' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900 text-left'>
                Próximos Passos
              </h3>
              <p className='text-sm text-gray-600 mt-0.5'>
                Após criar o projeto, você poderá:
              </p>
            </div>
          </div>

          <ul className='space-y-2.5 ml-14'>
            <li className='flex items-start gap-2 text-sm text-gray-700'>
              <span className='w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0'></span>
              <span>Configurar as tabelas de origem</span>
            </li>
            <li className='flex items-start gap-2 text-sm text-gray-700'>
              <span className='w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0'></span>
              <span>Definir o mapeamento entre origem e destino</span>
            </li>
            <li className='flex items-start gap-2 text-sm text-gray-700'>
              <span className='w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0'></span>
              <span>Executar a migração dos dados</span>
            </li>
          </ul>
        </div>

        <Table onParentHandleFormSubmit={parentHandleFormSubmit} />

        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6'>
          <div className='px-6 py-5 border-b border-gray-200 bg-gray-50'>
            <div className='flex items-center justify-between text-left'>
              <div>
                <h2 className='text-lg font-semibold text-gray-900 text-left'>
                  Configurar de-para
                </h2>
                <p className='text-sm text-gray-600 mt-1 text-left'>
                  Configure o relacionamento entre as tabelas de origem e
                  destino
                </p>
              </div>

              <div className='flex items-center gap-3'>
                <ConfirmButton
                  Icon={<Settings className='w-4 h-4' />}
                  iconPosition='left'
                  onClick={() => navigate(`/migration-project/${id}/mapping`)}
                  text='Configurar'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
