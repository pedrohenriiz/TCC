import { ArrowLeft, Settings } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../../components/pageHeader';
import ConfirmButton from '../../../../components/ConfirmButton';

export default function Header() {
  const navigate = useNavigate();
  const { id } = useParams();

  function handleGoBack() {
    navigate('/migration-projects');
  }

  return (
    <div className='bg-white border-b border-gray-200'>
      <div className='max-w-6xl mx-auto py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-cente justify-between'>
            <button
              onClick={handleGoBack}
              className='p-2 hover:bg-gray-100 rounded-lg transition hover:cursor-pointer mr-2'
            >
              <ArrowLeft className='w-5 h-5' />
            </button>
            <div>
              <PageHeader
                title={
                  id === 'new' ? 'Novo Projeto de Migração' : 'Editar Projeto'
                }
              />
              <p className='text-xs text-gray-600 mt-0.5'>
                Configure o projeto de migração
              </p>
            </div>
          </div>

          <ConfirmButton
            Icon={<Settings className='w-4 h-4' />}
            iconPosition='left'
            onClick={() => navigate(`/migration-project/${id}/mapping`)}
            text='Configurar'
          />
        </div>
      </div>
    </div>
  );
}
