import { Eye, Trash2, Edit } from 'lucide-react';
import DataTable from '../../../../components/DataTable';

export default function Table({ data, handleEdit, handleDelete }) {
  const baseTypeConfig = {
    string: { color: 'bg-blue-100 text-blue-700' },
    number: { color: 'bg-green-100 text-green-700' },
    date: { color: 'bg-purple-100 text-purple-700' },
    boolean: { color: 'bg-yellow-100 text-yellow-700' },
  };

  const columns = [
    {
      key: 'name',
      header: 'Nome',
      accessor: (row) => row.name,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      render: (value, row) => (
        <div>
          <div className='font-mono font-semibold text-gray-800'>{value}</div>
          {row.description && (
            <div className='text-xs text-gray-500 mt-1'>{row.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'base_type',
      header: 'Tipo Base',
      accessor: (row) => row.base_type,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      render: (_, row) => {
        return (
          <span
            className={`inline-flex items-center gap-2 ${
              baseTypeConfig[row.baseType].color
            } px-3 py-1  rounded-full text-sm font-medium`}
          >
            <span> {row.baseType}</span>
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
      render: (_, row) => (
        <div className='flex items-center justify-center gap-2'>
          <button
            onClick={() => handleView(row)}
            className='p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition'
            title='Visualizar detalhes'
          >
            <Eye className='w-4 h-4' />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className='p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition'
            title='Editar tipo'
          >
            <Edit className='w-4 h-4' />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className='p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition'
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
      <DataTable columns={columns} data={data} />
    </div>
  );
}
