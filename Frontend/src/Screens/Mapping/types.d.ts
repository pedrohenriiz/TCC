export interface MappingColumnDataProps {
  id: number;
  origin_table_id: number;
  destiny_table_id: number;
  destiny_column_id: number;
  origin_column_id: number;
  created_at: string;
  columns: { id: number; name: string }[];
  origin_table: {
    id: number;
    name: string;
    columns: { id: number; name: string }[];
  };
  origin_column: {
    id: number;
    name: string;
    columns: { id: number; name: string }[];
  };
  destiny_column: {
    id: number;
    name: string;
    columns: { id: number; name: string }[];
  };
  destiny_table: {
    id: number;
    name: string;
    columns: { id: number; name: string }[];
  };
  transformations: unknown[];
}

export interface MappingDataProps {
  id: number;
  name: string;
  status: 'INCOMPLETE' | 'COMPLETE';
  migration_project_id: number;
  updated_at: string;
  created_at: string;
  deleted_at: string;
  columns?: MappingColumnDataProps[];
}
