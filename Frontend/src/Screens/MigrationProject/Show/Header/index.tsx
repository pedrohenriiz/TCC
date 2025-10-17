import { ArrowLeft, Folder } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../../components/pageHeader';

export default function Header() {
  const navigate = useNavigate();
  const { id } = useParams();

  function handleGoBack() {
    navigate('/migration-projects');
  }

  return (
    <div className='flex items-center gap-2 mb-6'>
      <button
        onClick={handleGoBack}
        className='p-2 hover:bg-gray-200 rounded-lg transition hover:cursor-pointer'
      >
        <ArrowLeft className='w-5 h-5' />
      </button>
      <PageHeader
        title={id === 'new' ? 'Novo Projeto de Migração' : 'Editar Projeto'}
      />
    </div>
  );
}
