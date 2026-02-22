import { Pen, Trash2 } from 'lucide-react';
import { createColumn } from '../../../../../components/DataTable/createColumns';
import TableButton from '../../../../../components/TableButton';
import type { RowProps } from '..';

export default function TableColumns({
  onOpenCreateModal,
  onOpenDeleteModal,
}: {
  onOpenCreateModal: (row: RowProps) => void;
  onOpenDeleteModal: (row: RowProps) => void;
}) {
  const col = createColumn<RowProps>();

  const columns = [
    col({
      key: 'name',
      header: 'Nome da Tabela',
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      accessor: (row) => row.name,
    }),

    col({
      key: 'columns',
      header: 'Colunas',
      sortable: true,
      searchable: false,
      headerAlign: 'text-center',
      cellAlign: 'text-center',
      width: '100px',
      accessor: (row) => row.columns.length,
    }),

    col({
      key: 'createdAt',
      header: 'Criado em',

      sortable: true,
      searchable: false,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      width: '160px',

      accessor: (row) => row.created_at,
      render: (value) => {
        if (!value) return '-';

        return new Date(value).toLocaleString('pt-BR');
      },
    }),

    col({
      key: 'actions',
      header: 'Ações',
      accessor: () => null,
      sortable: false,
      searchable: false,
      headerAlign: 'text-center',
      cellAlign: 'text-center',
      width: '100px',

      render: (_, row) => (
        <div className='flex items-center justify-center gap-2'>
          <TableButton
            variant='edit'
            Icon={<Pen className='w-4 h-4' />}
            title='Editar tabela'
            onClick={() => {
              onOpenCreateModal(row);
            }}
          />

          <TableButton
            variant='delete'
            Icon={<Trash2 className='w-4 h-4' />}
            title='Excluir tabela'
            onClick={() => {
              onOpenDeleteModal(row);
            }}
          />
        </div>
      ),
    }),
  ];

  return columns;
}
