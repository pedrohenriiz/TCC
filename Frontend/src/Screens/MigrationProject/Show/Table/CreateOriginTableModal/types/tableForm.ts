export type ColumnType = 'text' | 'number' | 'date' | 'boolean';

export interface ColumnForm {
  id: number | string;
  name: string;
  type: string;
  is_natural_key: boolean;
}

export interface TableFormValues {
  id: number | string;
  name: string;
  migration_project_id: number | string;
  columns: ColumnForm[];
  is_pk: number | string | null;
}
