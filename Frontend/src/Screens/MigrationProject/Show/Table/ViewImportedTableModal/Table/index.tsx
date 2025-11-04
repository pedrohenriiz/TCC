import { Key } from 'lucide-react';
import DataTable from '../../../../../../components/DataTable';

export default function CustomTable({ data }) {
  const columns = [
    {
      name: 'name',
      header: 'Nome da coluna',
      accessor: (row: any) => row.name,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      render: (_: any, row: any) => (
        <span>
          {row.name}{' '}
          {row.primaryKey && (
            <span className='inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold'>
              <Key className='w-3 h-3' />
              PK
            </span>
          )}
        </span>
      ),
    },
    {
      name: 'type',
      header: 'Tipo dos dados',
      accessor: (row: any) => row.type,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      render: (_: any, row: any) => (
        <span
          className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
            row.type === 'number'
              ? 'bg-purple-100 text-purple-700'
              : row.type === 'date'
              ? 'bg-orange-100 text-orange-700'
              : row.type === 'boolean'
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {row.type}
        </span>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} />;
}
