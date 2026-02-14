// components/PDFReport/components/Table.tsx

import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../styles';

interface TableColumn {
  header: string;
  key: string;
  width?: string;
  render?: (value: any, row: any) => string;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
}

export function PDFTable({ columns, data }: TableProps) {
  return (
    <View style={pdfStyles.table}>
      {/* Header */}
      <View style={pdfStyles.tableHeader}>
        {columns.map((column, index) => (
          <Text
            key={index}
            style={[
              pdfStyles.tableCellHeader,
              { width: column.width || `${100 / columns.length}%` },
            ]}
          >
            {column.header}
          </Text>
        ))}
      </View>

      {/* Rows */}
      {data.map((row, rowIndex) => (
        <View key={rowIndex} style={pdfStyles.tableRow}>
          {columns.map((column, colIndex) => {
            const value = row[column.key];
            const displayValue = column.render
              ? column.render(value, row)
              : String(value || '-');

            return (
              <Text
                key={colIndex}
                style={[
                  pdfStyles.tableCell,
                  { width: column.width || `${100 / columns.length}%` },
                ]}
              >
                {displayValue}
              </Text>
            );
          })}
        </View>
      ))}
    </View>
  );
}
