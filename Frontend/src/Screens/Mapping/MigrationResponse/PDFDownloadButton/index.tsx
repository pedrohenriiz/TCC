// components/PDFReport/DownloadButton.tsx

import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileText } from 'lucide-react';
import type { MigrationResponse } from '../types';
import { MigrationPDFReport } from '../../../../components/MigrationReport';

interface PDFDownloadButtonProps {
  data: MigrationResponse;
  projectName?: string;
  executedBy?: string;
  fileName?: string;
}

export function PDFDownloadButton({
  data,
  projectName,
  executedBy,
  fileName,
}: PDFDownloadButtonProps) {
  const defaultFileName = `relatorio-migracao-${Date.now()}.pdf`;

  return (
    <PDFDownloadLink
      document={
        <MigrationPDFReport
          data={data}
          projectName={projectName}
          executedBy={executedBy}
        />
      }
      fileName={fileName || defaultFileName}
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className='px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <FileText className='w-4 h-4' />
          <span>{loading ? 'Gerando PDF...' : 'Exportar PDF'}</span>
        </button>
      )}
    </PDFDownloadLink>
  );
}
