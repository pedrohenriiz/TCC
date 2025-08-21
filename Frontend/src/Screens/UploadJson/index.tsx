import JsonView from '@uiw/react-json-view';
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

export default function UploadJson() {
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

  console.log(userDatabaseSchema);

  return (
    <div className='flex flex-col gap-4'>
      <h2 className='text-2xl font-semibold mb-2'>Estrutura do banco</h2>
      <p>Adicione o arquivo JSON com suas tabelas</p>

      <input
        type='file'
        accept='.json'
        onChange={handleFileChange}
        className='p-2 border border-gray-300 rounded'
      />

      {error && <p className='text-red-500'>{error}</p>}

      {fileName && (
        <p className='text-gray-700 p-4'>Arquivo selecionado: {fileName}</p>
      )}

      {jsonContent && (
        <div className='bg-gray-100 p-4 rounded overflow-auto max-h-96'>
          <JsonView value={jsonContent} />
        </div>
      )}

      <button
        className='
        bg-blue-600 
        hover:bg-blue-700 
        active:bg-blue-800 
        text-white 
        font-semibold 
        py-2 
        px-4 
        rounded 
        shadow 
        transition 
        duration-200 
        ease-in-out
        focus:outline-none
        focus:ring-2
        focus:ring-blue-400
        focus:ring-offset-1
        hover:cursor-pointer
        '
      >
        Salvar
      </button>
    </div>
  );
}
