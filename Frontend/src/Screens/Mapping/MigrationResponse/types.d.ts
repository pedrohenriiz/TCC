// types/migration.ts

/**
 * Erro individual de validação
 */
export interface ValidationError {
  row_index: number;
  table: string;
  column: string;
  error_type: string;
  message: string;
  value: any;
  severity: string;
  related_error?: string | null;
}

/**
 * Resultado da validação
 */
export interface ValidationResult {
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  orphaned_rows: number;
  success_rate: number;
  has_errors: boolean;
  error_count: number;
  errors: ValidationError[];
}

/**
 * Estatísticas de duplicatas
 */
export interface DuplicateStats {
  total_entities: number;
  total_keys: number;
  duplicates: number;
  entities: {
    [tableName: string]: {
      total_keys: number;
      duplicate_keys: number;
      unique_ids: number;
    };
  };
}

/**
 * Resposta completa da API de migração
 */
export interface MigrationResponse {
  status:
    | 'success'
    | 'completed_with_errors'
    | 'validation_failed'
    | 'aborted'
    | 'error';
  message: string;
  migration_project_id: number;
  error_strategy: string;
  sql_file: string | null;
  validation: ValidationResult;
  duplicate_warnings: number;
  stats: DuplicateStats;
}

/**
 * Wrapper da resposta da API
 */
export interface MigrationApiResponse {
  success: boolean;
  message: string;
  data: MigrationResponse;
  settings_used: {
    allow_duplicates: boolean;
    duplicate_strategy: string;
  };
}

/**
 * Tipos de erro para filtros
 */
export type ErrorType =
  | 'natural_key_not_found'
  | 'orphan_row'
  | 'duplicate'
  | 'type_mismatch'
  | 'null_violation'
  | 'string_length'
  | string;

/**
 * Status da migração
 */
export type MigrationStatus = 'idle' | 'loading' | 'success' | 'error';
