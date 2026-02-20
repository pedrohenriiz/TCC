import type { FormikProps } from 'formik';

interface TableConfigProps {
  name: string;
  exhibition_name: string;
  columns: ColumnProps[];
}
interface ColumnProps {
  id: number | string;
  name: string;
  type: string;
  size: number | string;
  is_pk: boolean;
  is_nullable: boolean;
  foreign_table_id: number | null;
  foreign_column_id: number | null;
  id_generation_strategy: string;
  id_start_value: number;
}

type FormProps = FormikProps<TableConfigProps>;
