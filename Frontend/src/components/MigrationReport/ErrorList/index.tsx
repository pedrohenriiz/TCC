// components/PDFReport/components/ErrorList.tsx

import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../styles';
import type { ValidationError } from '../../../Screens/Mapping/MigrationResponse/types';

interface ErrorListProps {
  errors: ValidationError[];
}

export function PDFErrorList({ errors }: ErrorListProps) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <View>
      {errors.map((error, index) => (
        <View key={index} style={pdfStyles.errorItem}>
          {/* Header */}
          <View style={pdfStyles.errorHeader}>
            <View>
              <Text style={pdfStyles.errorType}>
                {formatErrorType(error.error_type)}
              </Text>
            </View>
            <Text style={pdfStyles.errorLocation}>
              Linha {error.row_index} • {error.table}.{error.column}
            </Text>
          </View>

          {/* Message */}
          <Text style={pdfStyles.errorMessage}>{error.message}</Text>

          {/* Value */}
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <Text style={{ fontSize: 11, color: '#991b1b' }}>Valor:</Text>
            <Text style={pdfStyles.errorValue}>{formatValue(error.value)}</Text>
          </View>

          {/* Details */}
          {error.related_error && (
            <View style={pdfStyles.errorDetails}>
              <Text>
                <Text style={{ fontWeight: 'bold' }}>Detalhes: </Text>
                {error.related_error}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function formatErrorType(type: string): string {
  const formats: Record<string, string> = {
    natural_key_not_found: 'Chave Natural Não Encontrada',
    orphan_row: 'Linha Órfã',
    duplicate: 'Duplicata',
    type_mismatch: 'Tipo Incompatível',
    null_violation: 'Campo Obrigatório Vazio',
    string_length: 'Tamanho Excedido',
  };

  return formats[type] || type;
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
