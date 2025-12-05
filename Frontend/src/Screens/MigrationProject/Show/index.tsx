import * as Yup from 'yup';

import Header from './Header';
import Form from './Form';
import Table from './Table';
import { CheckCircle2, Settings } from 'lucide-react';
import ConfirmButton from '../../../components/ConfirmButton';
import { useEffect } from 'react';
import useSourceTablesStore from '../../../store/useSourceTableStore';
import { useFormik } from 'formik';
import { useQuery } from '@tanstack/react-query';
import { getUniqueMigrationProject } from '../../../services/migrationProjects/getUniqueMigrationProject';
import { useNavigate, useParams } from 'react-router-dom';
import { useMigrationProjectCreate } from '../../../hooks/MigrationProjects/useMigrationProjectCreate';
import { useMigrationProjectUpdate } from '../../../hooks/MigrationProjects/useMigrationProjectUpdate';
import useMigrationProjectStore from '../../../store/useMigrationProjectStore';

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

export default function ProjectForm() {
  const { id } = useParams<{ id: string }>();
  const { clearAllSourceTables } = useSourceTablesStore();
  const create = useMigrationProjectCreate();
  const update = useMigrationProjectUpdate();
  const { addProject, updateProject, getProjectById } =
    useMigrationProjectStore();
  const navigate = useNavigate();

  const { sourceTables, setSourceTableList } = useSourceTablesStore();

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
      const formattedData = {
        name: values.name,
        description: values.description,
      };
      console.log('Awudewa');

      if (id === 'new') {
        if (sourceTables) {
          formattedData.origin_tables = sourceTables;
        }
      } else {
        await update.mutateAsync({
          id: Number(id),
          data: formattedData,
        });
      }
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

      if (data?.origin_tables) {
        setSourceTableList(data.origin_tables);
      }
    }
  }, [id, data]);

  const parentHandleFormSubmit = () => {
    formik.handleSubmit();
  };

  useEffect(() => {
    return () => {
      clearAllSourceTables();
    };
  }, []);

  return (
    <div className='min-h-screen '>
      <div className=' mx-auto'>
        <Header />

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
