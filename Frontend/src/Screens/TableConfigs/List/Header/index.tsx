import { Plus } from 'lucide-react';
import ConfirmButton from '../../../../components/ConfirmButton';
import PageHeader from '../../../../components/pageHeader';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  return (
    <div className='flex items-center justify-between mb-6'>
      <PageHeader title='Configuração do Banco de Dados' />

      <ConfirmButton
        iconPosition='left'
        Icon={<Plus className='w-5 h-5' />}
        text='Nova tabela'
        onClick={() => navigate(`/tables-config/new`)}
      />
    </div>
  );
}
