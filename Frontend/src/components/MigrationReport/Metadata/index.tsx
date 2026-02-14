// components/PDFReport/components/Metadata.tsx

import { View, Text } from '@react-pdf/renderer';
import { pdfStyles } from '../styles';
import type { MigrationResponse } from '../../../Screens/Mapping/MigrationResponse/types';

interface MetadataProps {
  data: MigrationResponse;
  projectName?: string;
  executedBy?: string;
}

export function PDFMetadata({ data, projectName, executedBy }: MetadataProps) {
  const statusStyles = {
    success: pdfStyles.statusSuccess,
    completed_with_errors: pdfStyles.statusWarning,
    validation_failed: pdfStyles.statusError,
    aborted: pdfStyles.statusError,
    error: pdfStyles.statusError,
  };

  const statusLabels = {
    success: 'Sucesso',
    completed_with_errors: 'Concluída com Erros',
    validation_failed: 'Validação Falhou',
    aborted: 'Abortada',
    error: 'Erro',
  };

  const now = new Date();
  const formattedDate = now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={pdfStyles.metadata}>
      <View style={pdfStyles.metadataItem}>
        <Text style={pdfStyles.metadataLabel}>Projeto</Text>
        <Text style={pdfStyles.metadataValue}>
          {projectName || `Projeto #${data.migration_project_id}`}
        </Text>
      </View>

      <View style={pdfStyles.metadataItem}>
        <Text style={pdfStyles.metadataLabel}>Data de Execução</Text>
        <Text style={pdfStyles.metadataValue}>{formattedDate}</Text>
      </View>

      {executedBy && (
        <View style={pdfStyles.metadataItem}>
          <Text style={pdfStyles.metadataLabel}>Executado por</Text>
          <Text style={pdfStyles.metadataValue}>{executedBy}</Text>
        </View>
      )}

      <View style={pdfStyles.metadataItem}>
        <Text style={pdfStyles.metadataLabel}>Status</Text>
        <View>
          <Text style={[pdfStyles.statusBadge, statusStyles[data.status]]}>
            {statusLabels[data.status]}
          </Text>
        </View>
      </View>

      <View style={pdfStyles.metadataItem}>
        <Text style={pdfStyles.metadataLabel}>Estratégia de Erro</Text>
        <Text style={pdfStyles.metadataValue}>
          {formatStrategy(data.error_strategy)}
        </Text>
      </View>

      {data.sql_file && (
        <View style={pdfStyles.metadataItem}>
          <Text style={pdfStyles.metadataLabel}>Arquivo SQL Gerado</Text>
          <Text style={pdfStyles.metadataValue}>
            {data.sql_file.split('/').pop()}
          </Text>
        </View>
      )}
    </View>
  );
}

function formatStrategy(strategy: string): string {
  const strategies: Record<string, string> = {
    abort_on_first: 'Parar no Primeiro Erro',
    skip_invalid: 'Pular Inválidas',
    validate_all: 'Validar Todas (Dry-run)',
  };
  return strategies[strategy] || strategy;
}
