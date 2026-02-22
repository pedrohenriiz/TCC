import type { ColumnForm } from '../types/tableForm';

export function addColumn(columns: ColumnForm[]) {
  return [
    ...columns,
    {
      id: Date.now(),
      name: '',
      type: 'text',
      is_natural_key: false,
    },
  ];
}
