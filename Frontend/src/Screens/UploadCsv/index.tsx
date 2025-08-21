// src/pages/UploadCSV.tsx
import axios from 'axios';
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

export default function UploadCsv() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const setCsvColumns = useStore((state) => state.setCsvColumns);
  const csvColumns = useStore((state) => state.csvColumns);

  function wrongFileType(filetype: string) {
    return filetype !== 'text/csv';
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (wrongFileType(file.type)) {
      setMessage('Por favor, selecione um arquivo JSON válido.');
      setFileName(null);
      return;
    }

    setFileName(file.name);
    setIsLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Substitua pela URL da sua API
      const response = await axios.post(
        'http://localhost:8000/upload-csv',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log(response.data);

      setCsvColumns(response.data.columns);

      setMessage(response.data.message || 'Arquivo enviado com sucesso!');
    } catch (error) {
      console.error(error);
      setMessage('Erro ao enviar o arquivo.');
    } finally {
      setIsLoading(false);
    }
  };

  console.log(csvColumns);

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Upload de CSV</h1>

      <input
        type='file'
        accept='.csv'
        onChange={handleFileUpload}
        className='mb-4'
      />

      {fileName && <p className='mb-2 font-medium'>Arquivo: {fileName}</p>}

      {fileName && <p className='mb-2 font-medium'>Arquivo: {fileName}</p>}
      {isLoading && <p className='text-blue-600'>Enviando arquivo...</p>}
      {message && <p className='mt-2'>{message}</p>}
    </div>
  );
}
