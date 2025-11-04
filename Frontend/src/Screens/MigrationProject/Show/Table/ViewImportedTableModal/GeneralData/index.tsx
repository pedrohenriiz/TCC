import { Database } from 'lucide-react';

export default function GeneralData({ table }) {
  return (
    <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200'>
      <h3 className='text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2'>
        <Database className='w-4 h-4 text-blue-600' />
        Informações Gerais
      </h3>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='flex items-center flex-col gap-y-1'>
          <span className='text-xs text-gray-600'>Origem</span>
          <p className='font-semibold text-gray-900 mt-1 flex items-center'>
            {table.source === 'excel' ? 'Importado' : 'Manual'}
          </p>
        </div>

        <div className='flex items-center flex-col gap-y-1'>
          <span className='text-xs text-gray-600'>Arquivo</span>
          <p className='font-medium text-gray-900 mt-1 truncate'>
            {table.fileName || '-'}
          </p>
        </div>

        <div className='flex items-center flex-col gap-y-1'>
          <span className='text-xs text-gray-600'>Total de Linhas</span>
          <p className='font-semibold text-gray-900 mt-1 text-lg'>
            {table.rowCount.toLocaleString('pt-BR')}
          </p>
        </div>

        <div className='flex items-center flex-col gap-y-1'>
          <span className='text-xs text-gray-600'>Total de Colunas</span>
          <p className='font-semibold text-gray-900 mt-1 text-lg'>
            {table.columns.length}
          </p>
        </div>
      </div>
    </div>
  );
}
