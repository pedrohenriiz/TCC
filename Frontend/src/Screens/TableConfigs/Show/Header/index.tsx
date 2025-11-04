import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../../components/pageHeader';

export default function Header() {
  const navigate = useNavigate();
  const { id } = useParams();

  const title = id === 'new' ? 'Nova Tabela' : 'Editar Tabela';

  return (
    <div className='flex items-center gap-3 mb-6'>
      <button
        onClick={() => navigate('/tables-configs')}
        className='p-2 hover:bg-gray-100 rounded-lg transition hover:cursor-pointer'
      >
        <ArrowLeft className='w-5 h-5' />
      </button>
      <PageHeader title={title} />
    </div>
  );
}
