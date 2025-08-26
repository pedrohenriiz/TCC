import JsonView from '@uiw/react-json-view';
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Link, useNavigate } from 'react-router-dom';

export default function UploadJson() {
  const navigate = useNavigate();

  const [fileName, setFileName] = useState<string | null>(null);
  const [jsonContent, setJsonContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const setUserDatabaseSchema = useStore(
    (state) => state.setUserDatabaseSchema
  );
  const userDatabaseSchema = useStore((state) => state.userDatabaseSchema);

  function wrongFileType(filetype: string) {
    return filetype !== 'application/json';
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (wrongFileType(file.type)) {
      setError('Por favor, selecione um arquivo JSON válido.');
      setFileName(null);
      setJsonContent(null);
      return;
    }

    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        setJsonContent(content);

        // Mudar para salvar apenas quando clicar no botão de salvar
        setUserDatabaseSchema(content);
      } catch (err) {
        setError('Erro ao ler o arquivo JSON.');
        setJsonContent(null);
      }
    };
    reader.readAsText(file);
  };

  const navigateToColumnMapper = () => {
    navigate('/column-mapper');
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col '>
      <header className='bg-white shadow px-6 py-4 flex justify-between items-center'>
        <h1 className='text-xl font-bold text-gray-800'>
          <Link to='/'>Migração de dados</Link>
        </h1>
      </header>

      <div className='my-auto bg-gray-50 flex flex-col items-center justify-center px-4'>
        <div className='my-auto bg-white shadow-lg rounded-2xl p-8 max-w-lg w-full'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-2'>
            Estrutura do banco
          </h2>
          <p className='text-gray-500 mb-6'>
            Adicione o arquivo JSON com suas tabelas
          </p>

          {/* Upload do JSON */}
          <label
            htmlFor='json-upload'
            className='cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50 transition'
          >
            <span className='text-gray-600 mb-2'>
              Clique para selecionar ou arraste o arquivo
            </span>
            <input
              id='json-upload'
              type='file'
              accept='.json'
              onChange={handleFileChange}
              className='hidden'
            />
          </label>

          {/* Nome do arquivo */}
          {fileName && (
            <p className='mt-4 text-gray-700'>
              <span className='font-medium text-blue-600'>Selecionado:</span>{' '}
              {fileName}
            </p>
          )}

          {/* Mensagens de erro */}
          {error && <p className='mt-2 text-red-600'>{error}</p>}

          {/* Visualização JSON */}
          {jsonContent && (
            <div className='bg-gray-100 p-4 rounded overflow-auto max-h-96 mt-4'>
              <JsonView value={jsonContent} />
            </div>
          )}

          {/* Botão de salvar */}
          <button
            disabled={!jsonContent}
            onClick={navigateToColumnMapper}
            className={`mt-6 w-full px-4 py-2 rounded-lg text-white font-medium shadow transition duration-200 ease-in-out ${
              jsonContent
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
