import { FileSpreadsheet, Plus } from 'lucide-react';
import ConfirmButton from '../../../../../components/ConfirmButton';

interface EmptyTableProps {
  onCreateTableModal: () => void;
}

export default function EmptyTable({ onCreateTableModal }: EmptyTableProps) {
  return (
    <div className='flex flex-col items-center justify-center text-center max-w-lg mx-auto'>
      <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5'>
        <FileSpreadsheet className='w-10 h-10 text-gray-400' />
      </div>

      <h3 className='text-xl font-semibold text-gray-900 mb-2'>
        Nenhuma tabela cadastrada
      </h3>

      <p className='text-sm text-gray-600 mb-8 leading-relaxed'>
        Comece criando uma tabela para iniciar a configuração da migração de
        dados.
      </p>

      <div className='flex gap-3'>
        <ConfirmButton
          Icon={<Plus className='w-4 h-4' />}
          text='Adicionar tabela'
          iconPosition='left'
          onClick={onCreateTableModal}
        />
      </div>
    </div>
  );
}
