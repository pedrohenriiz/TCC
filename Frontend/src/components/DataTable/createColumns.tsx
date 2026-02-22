import type { ColumnDataProps } from '.';

export function createColumn<TRow>() {
  return function <TValue>(
    column: ColumnDataProps<TRow, TValue>,
  ): ColumnDataProps<TRow, TValue> {
    return column;
  };
}
