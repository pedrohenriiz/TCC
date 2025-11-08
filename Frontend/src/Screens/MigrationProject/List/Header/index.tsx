import { Plus } from 'lucide-react';
import PageHeader from '../../../../components/pageHeader';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  return (
    <div className='flex items-center justify-between mb-6'>
      <PageHeader title={'Projetos de Migração'} />
      <button
        onClick={() => navigate('/migration-project/new')}
        className='flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition hover:cursor-pointer'
      >
        <Plus className='w-5 h-5' />
        Novo Projeto
      </button>
    </div>
  );
}
