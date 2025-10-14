import { Eye, Trash2, Edit, Key, AlertCircle } from 'lucide-react';
import DataTable from '../../../../components/DataTable';

export default function Table({ columns, handleEditRow, deleteRow }) {
  console.log(columns);

  // Configuração de cores por tipo de dado
  const dataTypeConfig = {
    INT: { color: 'bg-blue-100 text-blue-700' },
    BIGINT: { color: 'bg-blue-100 text-blue-700' },
    VARCHAR: { color: 'bg-green-100 text-green-700' },
    TEXT: { color: 'bg-green-100 text-green-700' },
    DATETIME: { color: 'bg-purple-100 text-purple-700' },
    DATE: { color: 'bg-purple-100 text-purple-700' },
    BOOLEAN: { color: 'bg-yellow-100 text-yellow-700' },
    DECIMAL: { color: 'bg-orange-100 text-orange-700' },
    FLOAT: { color: 'bg-orange-100 text-orange-700' },
  };

  // Definição das colunas da tabela
  const table_columns = [
    {
      key: 'column',
      header: 'Nome da Coluna',
      accessor: (row) => row.column_name,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      render: (_, row) => (
        <div className='flex items-center gap-2'>
          <span className='font-mono font-semibold text-gray-800'>
            {row.column}
          </span>
          {row.is_primary_key && (
            <span className='inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium'>
              <Key className='w-3 h-3' />
              PK
            </span>
          )}
          {!row.is_nullable && !row.is_primary_key && (
            <span className='inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium'>
              <AlertCircle className='w-3 h-3' />
              NOT NULL
            </span>
          )}
          {row.is_auto_increment && (
            <span className='bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium'>
              AUTO
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'data_type',
      header: 'Tipo',
      accessor: (row) => row.data_type,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      render: (value, row) => {
        const config = dataTypeConfig[row.type] || {
          color: 'bg-gray-100 text-gray-700',
        };

        const typeDisplay = row.max_length
          ? `${value}(${row.max_length})`
          : value;

        return (
          <span
            className={`inline-flex items-center ${config.color} px-3 py-1 rounded-lg text-sm font-medium font-mono`}
          >
            {row.type}
          </span>
        );
      },
    },
    {
      key: 'default_value',
      header: 'Valor Padrão',
      accessor: (row) => row.default_value,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      render: (value, row) => {
        if (row.value === null) {
          return <span className='text-gray-400 text-sm italic'>NULL</span>;
        }

        return (
          <span className='font-mono text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded'>
            {row.value}
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
            title='Editar coluna'
          >
            <Edit className='w-4 h-4' />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className='p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition'
            title='Excluir coluna'
            disabled={row.is_primary_key}
          >
            <Trash2 className='w-4 h-4' />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className='overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white'>
      <DataTable
        columns={table_columns}
        data={columns}
        searchable={true}
        searchPlaceholder='Buscar por nome da coluna, tipo ou valor padrão...'
        emptyMessage='Nenhuma coluna encontrada'
      />
    </div>
  );
}
