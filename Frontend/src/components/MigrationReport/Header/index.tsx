// components/PDFReport/components/Header.tsx

import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../styles';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function PDFHeader({
  title = 'Relatório de Migração de Dados',
  subtitle = 'Análise completa do processo de migração',
}: HeaderProps) {
  return (
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.logo}>Migrare</Text>
      <Text style={pdfStyles.reportTitle}>{title}</Text>
      <Text style={pdfStyles.reportSubtitle}>{subtitle}</Text>
    </View>
  );
}
