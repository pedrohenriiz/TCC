// components/PDFReport/components/Stats.tsx

import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../styles';
import type { ValidationResult } from '../../../Screens/Mapping/MigrationResponse/types';

interface StatsProps {
  validation: ValidationResult;
}

export function PDFStats({ validation }: StatsProps) {
  return (
    <View style={pdfStyles.statsGrid}>
      {/* Total */}
      <View style={[pdfStyles.statCard, pdfStyles.statCardTotal]}>
        <Text style={pdfStyles.statLabel}>Total</Text>
        <Text style={[pdfStyles.statValue, pdfStyles.statValueTotal]}>
          {validation.total_rows}
        </Text>
      </View>

      {/* Válidas */}
      <View style={[pdfStyles.statCard, pdfStyles.statCardSuccess]}>
        <Text style={pdfStyles.statLabel}>Válidas</Text>
        <Text style={[pdfStyles.statValue, pdfStyles.statValueSuccess]}>
          {validation.valid_rows}
        </Text>
      </View>

      {/* Inválidas */}
      <View style={[pdfStyles.statCard, pdfStyles.statCardError]}>
        <Text style={pdfStyles.statLabel}>Inválidas</Text>
        <Text style={[pdfStyles.statValue, pdfStyles.statValueError]}>
          {validation.invalid_rows}
        </Text>
      </View>

      {/* Taxa */}
      <View style={[pdfStyles.statCard, pdfStyles.statCardRate]}>
        <Text style={pdfStyles.statLabel}>Taxa</Text>
        <Text style={[pdfStyles.statValue, pdfStyles.statValueRate]}>
          {validation.success_rate.toFixed(0)}%
        </Text>
      </View>
    </View>
  );
}
