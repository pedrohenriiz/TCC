import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import axios from 'axios';

export default function ColumnMapper() {
  const {
    userDatabaseSchema,
    csvColumns,
    setColumnMapping,
    columnMapping,
    csvFile,
  } = useStore((state) => state);

  // Inicializamos o estado com o mapeamento atual ou vazio
  const [currentMapping, setCurrentMapping] = useState<
    Record<string, Record<string, string>>
  >(columnMapping || {});

  useEffect(() => {
    setCurrentMapping(columnMapping || {});
  }, [columnMapping]);

  const handleMap = (
    tableName: string,
    tableColumn: string,
    csvColumn: string
  ) => {
    setCurrentMapping({
      ...currentMapping,
      [tableName]: {
        ...(currentMapping[tableName] || {}),
        [tableColumn]: csvColumn,
      },
    });
  };

  const handleSave = () => {
    setColumnMapping(currentMapping);
    alert('Mapeamento salvo!');
  };

  const handleSubmit = async () => {
    if (!csvFile) {
      alert('Nenhum arquivo CSV carregado!');
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile); // arquivo csv
    formData.append('schema', JSON.stringify(userDatabaseSchema)); // schema
    formData.append('mapping', JSON.stringify(currentMapping)); // mapping

    try {
      const res = await axios.post(
        'http://localhost:8000/generate-sql',
        formData
      );

      if (!res.ok) {
        throw new Error('Erro ao gerar SQL');
      }

      const data = await res.json();
      alert('SQL gerado com sucesso! Veja no console.');
    } catch (err) {
      alert('Erro ao enviar para API');
    }
  };

  if (!userDatabaseSchema || csvColumns.length === 0) {
    return <p>É necessário carregar o JSON e o CSV primeiro.</p>;
  }

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      {/* Header */}
      <header className='bg-white shadow px-6 py-4 flex justify-between items-center'>
        <h1 className='text-xl font-bold text-gray-800'>Migração de dados</h1>
      </header>

      <div className='min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4'>
        <div className='w-full max-w-4xl'>
          <h2 className='text-2xl font-bold text-gray-800 mb-6 text-center'>
            Mapeamento de Colunas
          </h2>

          {Object.entries(userDatabaseSchema).map(
            ([tableName, tableObj]: [string, any]) => (
              <div
                key={tableName}
                className='mb-6 border border-gray-300 rounded-xl p-6 bg-white shadow-sm'
              >
                <h3 className='text-xl font-semibold text-gray-700 mb-4'>
                  {tableName}
                </h3>
                {tableObj.columns.map((tableCol: string) => (
                  <div key={tableCol} className='mb-4 flex items-center'>
                    <label className='w-40 text-gray-600 font-medium'>
                      {tableCol}:
                    </label>
                    <select
                      value={currentMapping[tableName]?.[tableCol] || ''}
                      onChange={(e) =>
                        handleMap(tableName, tableCol, e.target.value)
                      }
                      className='flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400'
                    >
                      <option value=''>Selecione a coluna CSV</option>
                      {csvColumns.map((csvCol) => (
                        <option key={csvCol} value={csvCol}>
                          {csvCol}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )
          )}

          <div className='flex justify-center gap-4 mt-6'>
            <button
              onClick={handleSave}
              className='px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 transition'
            >
              Salvar Mapeamento
            </button>
            <button
              onClick={handleSubmit}
              className='px-6 py-2 rounded-lg bg-green-600 text-white font-medium shadow hover:bg-green-700 transition'
            >
              Enviar para API
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
