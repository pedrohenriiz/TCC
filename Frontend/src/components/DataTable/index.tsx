import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

export interface ColumnDataProps<TRow, TValue = unknown> {
  key: string;
  header: string;
  sortable?: boolean;
  searchable?: boolean;
  headerAlign?: string;
  cellAlign?: string;
  width?: string;

  accessor: (row: TRow) => TValue;
  render?: (value: TValue, row: TRow, index: number) => React.ReactNode;
}

type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: string | null;
  direction: SortDirection;
}

interface DataTableProps<TRow> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDataProps<TRow, any>[];
  data: TRow[];
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  isLoading?: boolean;
}

export default function DataTable<T>({
  columns,
  data,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum registro encontrado',
  className = '',
  isLoading = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc',
  });

  // Filtrar dados pela busca
  const filteredData = searchable
    ? data.filter((row) =>
        columns.some((col) => {
          if (!col.searchable) return false;
          const value = col.accessor(row);
          return String(value ?? '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        }),
      )
    : data;

  // Ordenar dados
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const column = columns.find((col) => col.key === sortConfig.key);
    if (!column?.sortable) return filteredData;

    return [...filteredData].sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const aValue = column.accessor(a) as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bValue = column.accessor(b) as any;

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [columns, filteredData, sortConfig]);

  // Função de ordenação
  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    setSortConfig((prev) => ({
      key: columnKey,
      direction:
        prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}
    >
      {/* Busca */}
      {searchable && (
        <div className='p-4 border-b'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
            <input
              type='text'
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none'
            />
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b'>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-sm font-semibold text-gray-700 ${
                    column.headerAlign || 'text-left'
                  } ${
                    column.sortable
                      ? 'cursor-pointer select-none hover:bg-gray-100'
                      : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className='flex items-center gap-2'>
                    {column.header}
                    {column.sortable && (
                      <div className='flex flex-col'>
                        {sortConfig.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className='w-4 h-4' />
                          ) : (
                            <ChevronDown className='w-4 h-4' />
                          )
                        ) : (
                          <div className='w-4 h-4 text-gray-300'>
                            <ChevronUp className='w-3 h-3' />
                            <ChevronDown className='w-3 h-3 -mt-1' />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y'>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className='px-6 py-12 text-center bg-gray-100'
                >
                  <p className='text-center font-bold'>Carregando...</p>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className='px-6 py-12 text-center text-gray-500'
                >
                  <p className='text-lg'>{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr key={rowIndex} className='hover:bg-gray-50 transition'>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 ${column.cellAlign || 'text-left'}`}
                    >
                      {column.render
                        ? column.render(column.accessor(row), row, rowIndex)
                        : String(column.accessor(row) ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
