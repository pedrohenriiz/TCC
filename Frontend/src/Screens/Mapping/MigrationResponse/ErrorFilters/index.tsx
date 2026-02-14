// pages/Mapping/components/MigrationResult/ErrorFilters.tsx

import { useMemo } from 'react';
import type { ValidationError } from '../types';

interface ErrorFiltersProps {
  errors: ValidationError[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export function ErrorFilters({ errors, selectedFilter, onFilterChange }: ErrorFiltersProps) {
  // Extrai filtros únicos dos erros
  const filters = useMemo(() => {
    const tables = new Set<string>();
    const types = new Set<string>();
    
    errors.forEach(error => {
      tables.add(error.table);
      types.add(error.error_type);
    });
    
    return {
      tables: Array.from(tables),
      types: Array.from(types),
    };
  }, [errors]);
  
  const allFilters = [
    { id: 'all', label: `Todas (${errors.length})`, type: 'all' },
    ...filters.tables.map(table => ({
      id: `table:${table}`,
      label: table,
      type: 'table'
    })),
    ...filters.types.map(type => ({
      id: `type:${type}`,
      label: formatErrorType(type),
      type: 'type'
    })),
  ];
  
  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Filtros:</span>
        
        {allFilters.map(filter => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${selectedFilter === filter.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper para formatar tipos de erro
function formatErrorType(type: string): string {
  const formats: Record<string, string> = {
    'natural_key_not_found': 'FK não encontrada',
    'orphan_row': 'Linha órfã',
    'duplicate': 'Duplicata',
    'type_mismatch': 'Tipo incompatível',
    'null_violation': 'NOT NULL',
    'string_length': 'Tamanho excedido',
  };
  
  return formats[type] || type;
}