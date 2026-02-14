// components/PDFReport/components/Footer.tsx

import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../styles';

export function PDFFooter() {
  const now = new Date();
  const formattedDateTime = now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <View style={pdfStyles.footer}>
      <Text style={pdfStyles.footerText}>
        Relatório gerado automaticamente pelo Migrare v1.0
      </Text>
      <Text style={pdfStyles.footerText}>{formattedDateTime}</Text>
      <Text style={pdfStyles.footerTextSmall}>
        Este documento contém informações confidenciais da migração de dados.
      </Text>
    </View>
  );
}
