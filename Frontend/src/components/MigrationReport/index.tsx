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
      {/* Página 1: Resumo */}
      <Page size='A4' style={pdfStyles.page}>
        <PDFHeader />

        <PDFMetadata
          data={data}
          projectName={projectName}
          executedBy={executedBy}
        />

        {/* Resumo Executivo */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Resumo Executivo</Text>

          <PDFStats validation={data.validation} />

          <PDFInfoBox title='Informação Importante'>
            {getStrategyInfo(data.error_strategy)}
          </PDFInfoBox>
        </View>

        {/* Detalhamento por Tabela */}
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

        {data.sql_file && (
          <View style={{ marginTop: 20 }}>
            <PDFInfoBox title='Arquivo SQL'>
              O arquivo SQL foi gerado em: {data.sql_file.split('/').pop()}
            </PDFInfoBox>
          </View>
        )}
      </Page>

      {/* Página 2: Erros (se houver) */}
      {data.validation.has_errors && (
        <Page size='A4' style={pdfStyles.page}>
          <PDFHeader
            title='Relatório de Erros'
            subtitle='Detalhamento completo dos erros encontrados'
          />

          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>
              Erros Encontrados ({data.validation.error_count})
            </Text>

            <PDFErrorList errors={data.validation.errors} />
          </View>

          {/* Recomendações */}
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Recomendações</Text>

            <PDFInfoBox title='Ações Sugeridas'>
              1. Verificar dados de origem nos arquivos CSV{'\n'}
              2. Confirmar se o mapeamento de colunas está correto{'\n'}
              3. Validar se as natural keys estão configuradas{'\n'}
              4. Re-executar a migração após correções
            </PDFInfoBox>
          </View>

          <PDFFooter />
        </Page>
      )}

      {/* Página 2 alternativa: Sucesso (se não houver erros) */}
      {!data.validation.has_errors && (
        <Page size='A4' style={pdfStyles.page}>
          <PDFHeader
            title='Migração Concluída'
            subtitle='Todas as linhas foram processadas com sucesso'
          />

          <View
            style={{
              padding: 40,
              backgroundColor: '#d1fae5',
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 100,
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: 20 }}>✅</Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#065f46',
                marginBottom: 10,
              }}
            >
              Migração Concluída com Sucesso!
            </Text>
            <Text style={{ fontSize: 14, color: '#047857' }}>
              Todas as {data.validation.total_rows} linhas foram processadas sem
              erros.
            </Text>
          </View>

          <PDFFooter />
        </Page>
      )}
    </Document>
  );
}

// Helpers
function getStrategyInfo(strategy: string): string {
  const info = {
    skip_invalid:
      'A migração foi executada com a estratégia skip_invalid. Linhas com erros foram automaticamente puladas e não foram inseridas no banco de dados. O arquivo SQL contém apenas as linhas válidas.',
    abort_on_first:
      'A migração foi executada com a estratégia abort_on_first. A migração parou ao encontrar o primeiro erro. Nenhum dado foi inserido no banco.',
    validate_all:
      'A migração foi executada em modo de validação (dry-run). Todos os dados foram validados, mas nenhum dado foi inserido no banco de dados.',
  };

  return info[strategy] || 'Estratégia de erro não especificada.';
}

function generateTableStats(data: MigrationResponse) {
  // Agrupa erros por tabela
  const errorsByTable: Record<string, number> = {};
  data.validation.errors.forEach((error) => {
    errorsByTable[error.table] = (errorsByTable[error.table] || 0) + 1;
  });

  // Gera estatísticas (exemplo simplificado)
  // Em produção, você precisaria de dados reais do backend
  const tables = Object.keys(errorsByTable);

  if (tables.length === 0) {
    // Sem erros - retorna dados de sucesso
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

  return tables.map((table) => {
    const skipped = errorsByTable[table] || 0;
    const total = data.validation.total_rows; // Simplificado
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
