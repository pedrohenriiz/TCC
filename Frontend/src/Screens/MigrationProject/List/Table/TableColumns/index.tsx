import { Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TableButton from '../../../../../components/TableButton';
import { createColumn } from '../../../../../components/DataTable/createColumns';

interface TableColumnProps {
  onOpenDeleteModal: (row: { id: number; name: string }) => void;
}

interface MigrationProjectDataProps {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function TableColumns({ onOpenDeleteModal }: TableColumnProps) {
  const navigate = useNavigate();

  const handleView = (row: { id: number }) => {
    navigate(`/migration-project/${row.id}`);
  };

  const col = createColumn<MigrationProjectDataProps>();

  const columns = [
    col({
      key: 'name',
      header: 'Nome',
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      accessor: (row) => row.name,
    }),

    col({
      key: 'description',
      header: 'Descrição',
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      accessor: (row) => row.description,
    }),

    col({
      key: 'created_at',
      header: 'Criado em',
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      accessor: (row) => row.created_at,
      render: (value) => {
        if (!value) return '-';

        const date = new Date(value);

        return (
          <span className='text-sm text-gray-600'>
            {date.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        );
      },
    }),

    col({
      key: 'updated_at',
      header: 'Atualizado em',
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      accessor: (row) => row.updated_at,
      render: (value) => {
        if (!value) return '-';

        const date = new Date(value);

        return (
          <span className='text-sm text-gray-600'>
            {date.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        );
      },
    }),

    col({
      key: 'actions',
      header: 'Ações',
      sortable: false,
      searchable: false,
      headerAlign: 'text-center',
      cellAlign: 'text-center',
      width: '150px',
      accessor: () => null,
      render: (_, row) => (
        <div className='flex items-center justify-center gap-2'>
          <TableButton
            Icon={<Eye className='w-4 h-4' />}
            title='Visualizar detalhes'
            variant='view'
            onClick={() => handleView(row)}
          />

          <TableButton
            Icon={<Trash2 className='w-4 h-4' />}
            onClick={() => onOpenDeleteModal(row)}
            title='Excluir tipo'
            variant='delete'
          />
        </div>
      ),
    }),
  ];

  return columns;
}
