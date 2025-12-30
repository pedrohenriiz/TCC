import { Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TableButton from '../../../../../components/TableButton';

interface TableColumnProps {
  onOpenDeleteModal: (row: { id: number; name: string }) => void;
}

export default function TableColumns({ onOpenDeleteModal }: TableColumnProps) {
  const navigate = useNavigate();

  const handleView = (row: { id: number }) => {
    navigate(`/migration-project/${row.id}`);
  };

  const columns = [
    {
      name: 'name',
      header: 'Nome',
      accessor: (row: { name: string }) => row.name,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
    },
    {
      name: 'description',
      header: 'Descrição',
      accessor: (row: { description: string }) => row.description,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
    },
    {
      name: 'created_at',
      header: 'Criado em',
      accessor: (row: { created_at: Date }) => row.created_at,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      render: (value: Date) => {
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
    },
    {
      name: 'updated_at',
      header: 'Atualizado em',
      accessor: (row: { updated_at: Date }) => row.updated_at,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      render: (value: Date) => {
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
    },
    {
      name: 'actions',
      header: 'Ações',
      accessor: () => null,
      sortable: false,
      searchable: false,
      headerAlign: 'text-center',
      cellAlign: 'text-center',
      width: '150px',
      render: (_: null, row: { id: number; name: string }) => (
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
    },
  ];

  return columns;
}
