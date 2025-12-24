import { Link2, Plus } from 'lucide-react';
import ConfirmButton from '../../../../../components/ConfirmButton';
import type { MappingDataProps } from '../../../types';

interface EmptyMappingListProps {
  onOpenEditing: (mapping?: MappingDataProps | null) => void;
}

export default function EmptyMappingList({
  onOpenEditing,
}: EmptyMappingListProps) {
  return (
    <div className='flex flex-col items-center justify-center py-12 px-6 text-center'>
      <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
        <Link2 className='w-8 h-8 text-blue-600' />
      </div>
      <h3 className='text-base font-semibold text-gray-900 mb-1'>
        Nenhum mapeamento criado
      </h3>
      <p className='text-xs text-gray-600 max-w-sm mb-4'>
        Crie seu primeiro mapeamento para relacionar colunas entre origens e
        destinos
      </p>

      <ConfirmButton
        Icon={<Plus className='w-4 h-4' />}
        iconPosition='left'
        text='Criar Primeiro Mapeamento'
        onClick={() => onOpenEditing()}
      />
    </div>
  );
}
