// components/PDFReport/index.tsx

import { Document, Page, View, Text } from '@react-pdf/renderer';
import { pdfStyles } from './styles';
import { PDFHeader } from './Header';
import { PDFMetadata } from './Metadata';
import { PDFStats } from './Stats';
import { PDFInfoBox } from './InfoBox';
import { PDFTable } from './Table';
import { PDFErrorList } from './ErrorList';
import { PDFFooter } from './Footer';
import type { MigrationResponse } from '../../Screens/Mapping/MigrationResponse/types';

interface MigrationPDFReportProps {
  data: MigrationResponse;
  projectName?: string;
  executedBy?: string;
}

export function MigrationPDFReport({
  data,
  projectName,
  executedBy,
}: MigrationPDFReportProps) {
  return (
    <Document>
      <Page size='A4' style={pdfStyles.page}>
        <PDFHeader />

        <PDFMetadata
          data={data}
          projectName={projectName}
          executedBy={executedBy}
        />

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Resumo</Text>

          <PDFStats validation={data.validation} />

          <PDFInfoBox title='Informação Importante'>
            {getStrategyInfo(data.error_strategy)}
          </PDFInfoBox>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Detalhamento por Tabela</Text>

          <PDFTable
            columns={[
              { header: 'Tabela', key: 'table', width: '40%' },
              { header: 'Total', key: 'total', width: '15%' },
              { header: 'Inseridas', key: 'inserted', width: '15%' },
              { header: 'Puladas', key: 'skipped', width: '15%' },
              {
                header: 'Taxa',
                key: 'rate',
                width: '15%',
                render: (value) => `${value}%`,
              },
            ]}
            data={generateTableStats(data)}
          />
        </View>

        {data.validation.has_errors && (
          <>
            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionTitle}>
                Erros Encontrados ({data.validation.error_count})
              </Text>

              <PDFErrorList errors={data.validation.errors} />
            </View>

            <View style={pdfStyles.section}>
              <Text style={pdfStyles.sectionTitle}>Recomendações</Text>

              <PDFInfoBox title='Ações Sugeridas'>
                1. Verificar dados de origem nos arquivos CSV{'\n'}
                2. Confirmar se o mapeamento de colunas está correto{'\n'}
                3. Validar se as natural keys estão configuradas{'\n'}
                4. Re-executar a migração após correções
              </PDFInfoBox>
            </View>
          </>
        )}
        <PDFFooter />
      </Page>
    </Document>
  );
}

function getStrategyInfo(
  strategy: 'abort_on_first' | 'validate_all' | 'skip_invalid',
): string {
  const info = {
    skip_invalid:
      'A migração foi executada com a estratégia skip_invalid. Linhas com erros serão automaticamente puladas e não serão inseridas na migração. O arquivo SQL irá conter apenas as linhas válidas.',
    abort_on_first:
      'A migração foi executada com a estratégia abort_on_first. Com essa configuração ativa, a migração irá parar ao encontrar o primeiro erro. Nenhum dado foi migrado.',
    validate_all:
      'A migração foi executada em modo de validação (dry-run). Todos os dados serão validados, mas nenhum dado será inserido na migração.',
  };

  return info[strategy] || 'Estratégia de erro não especificada.';
}

function generateTableStats(data: MigrationResponse) {
  // Agrupa erros por tabela
  const errorsByTable: Record<string, number> = {};
  data.validation.errors.forEach((error) => {
    errorsByTable[error.table] = (errorsByTable[error.table] || 0) + 1;
  });

  const errors = Object.keys(errorsByTable);

  if (errors.length === 0) {
    return [
      {
        table: 'Todas as tabelas',
        total: data.validation.total_rows,
        inserted: data.validation.valid_rows,
        skipped: 0,
        rate: 100,
      },
    ];
  }

  return errors.map((table) => {
    const skipped = errorsByTable[table] || 0;
    const total = data.validation.total_rows;
    const inserted = total - skipped;
    const rate = ((inserted / total) * 100).toFixed(1);

    return {
      table,
      total,
      inserted,
      skipped,
      rate,
    };
  });
}
