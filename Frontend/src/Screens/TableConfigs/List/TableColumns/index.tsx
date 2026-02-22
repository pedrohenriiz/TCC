import { Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TableButton from '../../../../components/TableButton';
import { createColumn } from '../../../../components/DataTable/createColumns';

interface TableColumnProps {
  onOpenDeleteModal: (row: { id: number }) => void;
}

interface TableConfigDataProps {
  id: number;
  name: string;
  exhibition_name: string;
  total_columns: number;
  total_foreign_keys: number;
  created_at: Date;
}

export default function TableColumns({ onOpenDeleteModal }: TableColumnProps) {
  const navigate = useNavigate();

  const handleView = (row: { id: number }) => {
    navigate(`/tables-config/${row.id}`);
  };

  const col = createColumn<TableConfigDataProps>();

  const columns = [
    col({
      key: 'name',
      header: 'Nome da Tabela',
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      accessor: (row) => row.name,
      render: (value) => (
        <span className='font-mono font-semibold text-gray-800'>{value}</span>
      ),
    }),

    col({
      key: 'exhibition_name',
      header: 'Nome de Exibição',
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      accessor: (row) => row.exhibition_name,
      render: (value) => <span className='text-gray-700'>{value}</span>,
    }),

    col({
      key: 'total_columns',
      header: 'Colunas',
      sortable: true,
      searchable: false,
      headerAlign: 'text-center',
      cellAlign: 'text-center',
      accessor: (row) => row.total_columns,
      render: (value) => (
        <span className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium'>
          {value || 0}
        </span>
      ),
    }),

    col({
      key: 'total_foreign_keys',
      header: 'Relacionamentos',
      sortable: true,
      searchable: false,
      headerAlign: 'text-center',
      cellAlign: 'text-center',
      accessor: (row) => row.total_foreign_keys,
      render: (value) => (
        <span className='bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium'>
          {value} FK
        </span>
      ),
    }),

    col({
      key: 'created_at',
      header: 'Criado em',
      sortable: true,
      searchable: false,
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
            title='Excluir detalhes'
            variant='delete'
            onClick={() => onOpenDeleteModal(row)}
          />
        </div>
      ),
    }),
  ];

  return columns;
}
