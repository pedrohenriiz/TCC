// pages/Mapping/components/MigrationResult/index.tsx

import { useState, useMemo } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { useMigrationStore } from '../../../store/useMigrationStore';
import { SummaryStats } from './SummaryStats';
import { ErrorFilters } from './ErrorFilters';
import { ErrorCard } from './ErrorCard';
import { PDFDownloadButton } from './PDFDownloadButton';
import { DownloadSQLButton } from './DownloadSQLButton';

export function MigrationResult() {
  const { result, isResultVisible, hideResult } = useMigrationStore();
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filtra erros baseado no filtro selecionado
  const filteredErrors = useMemo(() => {
    if (!result?.validation.errors) return [];

    if (selectedFilter === 'all') {
      return result.validation.errors;
    }

    if (selectedFilter.startsWith('table:')) {
      const table = selectedFilter.replace('table:', '');
      return result.validation.errors.filter((error) => error.table === table);
    }

    if (selectedFilter.startsWith('type:')) {
      const type = selectedFilter.replace('type:', '');
      return result.validation.errors.filter(
        (error) => error.error_type === type,
      );
    }

    return result.validation.errors;
  }, [result, selectedFilter]);

  if (!isResultVisible || !result) {
    return null;
  }

  // Determina cor do header baseado no status
  const headerColor = getHeaderColor(result.status);

  return (
    <div className='mt-8 animate-slideUp'>
      <div className='bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden'>
        {/* Header */}
        <div className={`${headerColor} p-6 border-b border-opacity-20`}>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='text-left'>
                <h2 className='text-2xl font-bold text-gray-900'>
                  Resultado da Migração
                </h2>
                <p className='text-sm text-gray-700 mt-1'>{result.message}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div>
          {/* Resumo */}
          <SummaryStats
            validation={result.validation}
            sqlFile={result.sql_file}
          />

          {/* Filtros (só mostra se tiver erros) */}
          {result.validation.has_errors && (
            <ErrorFilters
              errors={result.validation.errors}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />
          )}

          {/* Lista de Erros */}
          {result.validation.has_errors && (
            <div className='p-6'>
              <h3 className='text-lg font-bold text-gray-900 mb-4'>
                Erros Encontrados ({filteredErrors.length})
              </h3>

              {filteredErrors.map((error, index) => (
                <ErrorCard key={index} error={error} />
              ))}

              {/* Info sobre estratégia */}
              {result.error_strategy === 'skip_invalid' && (
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4'>
                  <p className='text-sm text-blue-900'>
                    <span className='font-semibold'>Informação:</span> As linhas
                    com erro foram puladas automaticamente (estratégia:{' '}
                    <code className='px-2 py-0.5 bg-white rounded border border-blue-300'>
                      skip_invalid
                    </code>
                    ). O arquivo SQL contém apenas as linhas válidas.
                  </p>
                </div>
              )}

              {result.error_strategy === 'validate_all' && (
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4'>
                  <p className='text-sm text-yellow-900'>
                    <span className='font-semibold'>Modo Validação:</span> Esta
                    foi uma validação (dry-run). Nenhum dado foi inserido no
                    banco. Corrija os erros e execute novamente.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Mensagem de sucesso (sem erros) */}
          {!result.validation.has_errors && (
            <div className='p-6'>
              <div className='bg-green-50 border border-green-200 rounded-lg p-6 text-center'>
                <h3 className='text-xl font-bold text-green-900 mb-2'>
                  Migração Concluída com Sucesso!
                </h3>
                <p className='text-green-700'>
                  Todas as {result.validation.total_rows} linhas foram
                  processadas sem erros.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='bg-gray-50 p-6 border-t border-gray-200 flex items-center justify-between'>
          <div className='flex gap-2'>
            <DownloadSQLButton sqlFile={result.sql_file!} />

            <PDFDownloadButton
              data={result}
              projectName='Migração de Dados'
              executedBy='Usuário'
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helpers
function getHeaderColor(status: string): string {
  const colors: Record<string, string> = {
    success: 'bg-gradient-to-r from-green-50 to-emerald-50',
    completed_with_errors: 'bg-gradient-to-r from-yellow-50 to-orange-50',
    validation_failed: 'bg-gradient-to-r from-red-50 to-rose-50',
    aborted: 'bg-gradient-to-r from-red-50 to-orange-50',
    error: 'bg-gradient-to-r from-red-50 to-rose-50',
  };

  return colors[status] || 'bg-gradient-to-r from-gray-50 to-slate-50';
}

function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    success: '✅',
    completed_with_errors: '⚠️',
    validation_failed: '❌',
    aborted: '🛑',
    error: '❌',
  };

  return icons[status] || '📊';
}
