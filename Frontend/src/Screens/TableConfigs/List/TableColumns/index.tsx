import { Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TableColumnProps {
  onOpenDeleteModal: (row: { id: number }) => void;
}

export default function TableColumns({ onOpenDeleteModal }: TableColumnProps) {
  const navigate = useNavigate();

  const handleView = (row: { id: number }) => {
    navigate(`/tables-config/${row.id}`);
  };

  const columns = [
    {
      key: 'name',
      header: 'Nome da Tabela',
      accessor: (row: { name: string }) => row.name,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      render: (value: string) => (
        <span className='font-mono font-semibold text-gray-800'>{value}</span>
      ),
    },
    {
      key: 'exhibition_name',
      header: 'Nome de Exibição',
      accessor: (row: { exhibition_name: string }) => row.exhibition_name,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      render: (value: string) => <span className='text-gray-700'>{value}</span>,
    },
    {
      key: 'total_columns',
      header: 'Colunas',
      accessor: (row: { total_columns: number }) => row.total_columns,
      sortable: true,
      searchable: false,
      headerAlign: 'text-center',
      cellAlign: 'text-center',
      render: (value: number) => (
        <span className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium'>
          {value || 0}
        </span>
      ),
    },
    {
      key: 'total_foreign_keys',
      header: 'Relacionamentos',
      accessor: (row: { total_foreign_keys: number }) => row.total_foreign_keys,
      sortable: true,
      searchable: false,
      headerAlign: 'text-center',
      cellAlign: 'text-center',
      render: (value: number) => {
        return (
          <span className='bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium'>
            {value} FK
          </span>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Criado em',
      accessor: (row: { created_at: Date }) => row.created_at,
      sortable: true,
      searchable: false,
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
      key: 'actions',
      header: 'Ações',
      accessor: () => null,
      sortable: false,
      searchable: false,
      headerAlign: 'text-center',
      cellAlign: 'text-center',
      width: '150px',
      render: (_: any, row: { id: number }) => (
        <div className='flex items-center justify-center gap-2'>
          <button
            onClick={() => handleView(row)}
            className='p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition'
            title='Visualizar detalhes'
          >
            <Eye className='w-4 h-4' />
          </button>
          <button
            onClick={() => onOpenDeleteModal(row)}
            className='p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition'
            title='Excluir tabela'
          >
            <Trash2 className='w-4 h-4' />
          </button>
        </div>
      ),
    },
  ];

  return columns;
}
