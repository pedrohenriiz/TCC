import type { MappingDataProps } from '../types';
import MappingTable from './Table';
import EmptyMappingList from './Table/EmptyMappingList';

interface MappingPanelProps {
  id: string | undefined;
  onOpenEditing: (mapping?: MappingDataProps | null) => void;
  data: MappingDataProps[];
}

export default function MappingPanel({
  data,
  id,
  onOpenEditing,
}: MappingPanelProps) {
  return (
    <div className='bg-white rounded-lg border border-gray-200 shadow-sm'>
      <div className='px-4 py-3 border-b border-gray-200 bg-gray-50 text-left'>
        <h2 className='text-sm font-semibold text-gray-900 '>
          Mapeamentos Configurados
        </h2>
        <p className='text-xs text-gray-600 mt-0.5'>
          Cada mapeamento pode relacionar múltiplas tabelas de origem e destino
        </p>
      </div>

      <div className='divide-y divide-gray-200'>
        {data?.length > 0 && (
          <MappingTable data={data} id={id} onOpenEditing={onOpenEditing} />
        )}

        {data?.length === 0 && (
          <EmptyMappingList onOpenEditing={onOpenEditing} />
        )}
      </div>
    </div>
  );
}
