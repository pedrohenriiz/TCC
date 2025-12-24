import type { MappingDataProps } from '../../types';
import EmptyMappingList from './EmptyMappingList';
import MappingColumnsTable from './MappingColumnsTable';

interface MappingTableProps {
  data: MappingDataProps[];
  id: string | undefined;
  onOpenEditing: (mapping?: MappingDataProps | null) => void;
}

export default function MappingTable({
  data,
  id,
  onOpenEditing,
}: MappingTableProps) {
  return (
    <div className='divide-y divide-gray-200'>
      <MappingColumnsTable
        data={data}
        migrationProjectId={id}
        handleSetEditingRow={onOpenEditing}
      />

      {data?.length === 0 && <EmptyMappingList onOpenEditing={onOpenEditing} />}
    </div>
  );
}
