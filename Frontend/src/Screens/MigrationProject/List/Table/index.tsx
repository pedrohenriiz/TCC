import { Edit, Eye, Trash2 } from 'lucide-react';
import DataTable from '../../../../components/DataTable';
import useMigrationProjectStore from '../../../../store/useMigrationProjectStore';

export default function Table({ handleView, handleDelete }) {
  const { projects, deleteProject } = useMigrationProjectStore();

  const columns = [
    {
      name: 'name',
      header: 'Nome',
      accessor: (row) => row.name,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
    },
    {
      name: 'description',
      header: 'Descrição',
      accessor: (row) => row.description,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
    },
    {
      name: 'createdAt',
      header: 'Criado em',
      accessor: (row) => row.createdAt,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
    },
    {
      name: 'updatedAt',
      header: 'Atualizado em',
      accessor: (row) => row.updatedAt,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
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
      render: (_, row) => (
        <div className='flex items-center justify-center gap-2'>
          <button
            onClick={() => handleView(row)}
            className='p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition hover:cursor-pointer'
            title='Visualizar detalhes'
          >
            <Eye className='w-4 h-4' />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className='p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition hover:cursor-pointer'
            title='Excluir tipo'
          >
            <Trash2 className='w-4 h-4' />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className='overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white'>
      <DataTable columns={columns} data={projects} />
    </div>
  );
}
