// pages/Mapping/components/MigrationResult/SummaryStats.tsx

import type { ValidationResult } from '../types';

interface SummaryStatsProps {
  validation: ValidationResult;
  sqlFile: string | null;
}

export function SummaryStats({ validation, sqlFile }: SummaryStatsProps) {
  return (
    <div className="p-6 bg-gray-50 border-b border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo da Migração</h3>
      
      <div className="grid grid-cols-4 gap-4">
        {/* Total de Linhas */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Total de Linhas</p>
          <p className="text-3xl font-bold text-gray-900">{validation.total_rows}</p>
        </div>
        
        {/* Taxa de Sucesso */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Taxa de Sucesso</p>
          <p className="text-3xl font-bold text-green-600">
            {validation.success_rate.toFixed(1)}%
          </p>
        </div>
        
        {/* Linhas Válidas */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-700 mb-1">Válidas</p>
          <p className="text-3xl font-bold text-green-700">{validation.valid_rows}</p>
        </div>
        
        {/* Linhas Inválidas */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-red-700 mb-1">Inválidas</p>
          <p className="text-3xl font-bold text-red-700">{validation.invalid_rows}</p>
        </div>
      </div>
      
      {/* Arquivo SQL */}
      {sqlFile && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Arquivo SQL gerado:</span>
            <code className="ml-2 px-2 py-1 bg-white rounded border border-blue-300 text-sm">
              {sqlFile.split('/').pop()}
            </code>

            
          </p>
        </div>
      )}
    </div>
  );
}