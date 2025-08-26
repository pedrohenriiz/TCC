// src/pages/UploadCSV.tsx
import axios from 'axios';
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Link, useNavigate } from 'react-router-dom';

export default function UploadCsv() {
  const navigate = useNavigate();

  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);

  const { setCsvColumns, setCsvFile, csvColumns } = useStore((state) => state);

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

      setCsvFile(file);

      setMessage(response.data.message || 'Arquivo enviado com sucesso!');
    } catch (error) {
      console.error(error);
      setMessage('Erro ao enviar o arquivo.');
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToUploadJSON = () => {
    navigate('/upload-json');
  };

  console.log(csvColumns);

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      <header className='bg-white shadow px-6 py-4 flex justify-between items-center'>
        <h1 className='text-xl font-bold text-gray-800'>
          <Link to='/'>Migração de dados</Link>
        </h1>
      </header>

      <div className='my-auto bg-gray-50 flex flex-col items-center justify-center px-4'>
        <div className='bg-white shadow-lg rounded-2xl p-8 max-w-lg w-full text-center flex items-center flex-col'>
          <h1 className='text-2xl font-bold text-gray-800 mb-6'>
            Upload de CSV
          </h1>
          <p className='text-gray-500 mb-6'>
            Adicione o arquivo CSV com os dados, incluindo as colunas, para
            fazer a migração.
          </p>

          {/* Área de upload */}
          <label
            htmlFor='file-upload'
            className='cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-indigo-400 hover:bg-indigo-50 transition w-full mb-4'
          >
            <span className='text-gray-600 mb-2'>Clique para selecionar</span>
            <input
              id='file-upload'
              type='file'
              accept='.csv'
              onChange={handleFileUpload}
              className='hidden'
            />
          </label>

          {/* Nome do arquivo */}
          {fileName && (
            <p className='mt-4 text-gray-700'>
              <span className='font-medium text-indigo-600'>Selecionado:</span>{' '}
              {fileName}
            </p>
          )}

          {/* Status / Mensagens */}
          {isLoading && (
            <p className='text-blue-600 mt-2'>Enviando arquivo...</p>
          )}
          {message && !isLoading && (
            <p
              className={`mt-2 ${
                message.includes('Erro') ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {message}
            </p>
          )}

          {!isLoading && !hasError && csvColumns.length > 0 && (
            <button
              onClick={navigateToUploadJSON}
              className='flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition hover:cursor-pointer'
            >
              Adicionar sua estrutura de dados
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
