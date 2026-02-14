// pages/Mapping/components/MigrationResult/ErrorCard.tsx

import { Copy, FileText } from 'lucide-react';
import type { ValidationError } from '../types';
import { useToastStore } from '../../../../store/useToastStore';

interface ErrorCardProps {
  error: ValidationError;
}

export function ErrorCard({ error }: ErrorCardProps) {
  const { addToast } = useToastStore();

  const handleCopyError = () => {
    const errorText = `
Linha: ${error.row_index}
Tabela: ${error.table}
Coluna: ${error.column}
Tipo: ${error.error_type}
Mensagem: ${error.message}
Valor: ${error.value}
${error.related_error ? `Detalhes: ${error.related_error}` : ''}
    `.trim();

    navigator.clipboard.writeText(errorText);
    addToast('Erro copiado para a área de transferência', 'success');
  };

  return (
    <div className='bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-6 mb-4 transition-all hover:shadow-md'>
      <div className='flex items-start gap-4'>
        {/* Conteúdo */}
        <div className='flex-1'>
          {/* Badges */}
          <div className='flex items-center gap-2 mb-2 flex-wrap'>
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
              {formatErrorType(error.error_type)}
            </span>
            <span className='text-xs text-gray-500'>•</span>
            <span className='text-sm text-gray-600'>
              Linha {error.row_index}
            </span>
            <span className='text-xs text-gray-500'>•</span>
            <span className='text-sm text-gray-600'>
              {error.table}.{error.column}
            </span>
          </div>

          {/* Título */}
          <h4 className='text-lg font-bold text-gray-900 mb-2 text-left'>
            {error.message}
          </h4>

          {/* Valor com erro */}
          <p className='text-gray-700 mb-3 text-left'>
            Valor:{' '}
            <code className='px-2 py-1 bg-white rounded border border-red-300 text-red-700 font-mono text-sm'>
              {formatValue(error.value)}
            </code>
          </p>

          {/* Detalhes adicionais */}
          {error.related_error && (
            <div className='bg-white/70 rounded-lg p-4 mb-4 border border-red-200'>
              <p className='text-sm text-gray-700 text-left'>
                <span className='font-semibold'>Detalhes:</span>{' '}
                {error.related_error}
              </p>
            </div>
          )}

          {/* Ações */}
          <div className='flex gap-2'>
            <button
              onClick={handleCopyError}
              className='px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors'
            >
              <Copy className='w-4 h-4' />
              <span>Copiar Erro</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helpers
function formatErrorType(type: string): string {
  const formats: Record<string, string> = {
    natural_key_not_found: 'Chave natural não encontrada',
    orphan_row: 'Linha órfã',
    duplicate: 'Duplicata',
    type_mismatch: 'Tipo incompatível',
    null_violation: 'Campo obrigatório vazio',
    string_length: 'Tamanho excedido',
  };

  return formats[type] || type;
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
