// pages/Mapping/components/MigrationResult/SQLDownloadButton.tsx

import { useState } from 'react';
import { FileCode, Loader2 } from 'lucide-react';

interface SQLDownloadButtonProps {
  sqlFile: string | null;
}

export function DownloadSQLButton({ sqlFile }: SQLDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!sqlFile) return null;

  const filename = sqlFile.split('/').pop() ?? sqlFile;

  async function handleDownload() {
    setIsDownloading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/download/${filename}`,
      );

      if (!response.ok) {
        throw new Error(`Erro ao baixar arquivo: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Não foi possível baixar o arquivo. Tente novamente.');
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className='flex flex-col items-start gap-1'>
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className='px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors'
      >
        {isDownloading ? (
          <Loader2 className='w-4 h-4 animate-spin' />
        ) : (
          <FileCode className='w-4 h-4' />
        )}
        <span>{isDownloading ? 'Baixando...' : 'Baixar SQL'}</span>
      </button>

      {error && <p className='text-xs text-red-600'>{error}</p>}
    </div>
  );
}
