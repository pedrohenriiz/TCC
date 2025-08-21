import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';

export default function ColumnMapper() {
  const { userDatabaseSchema, csvColumns, setColumnMapping, columnMapping } =
    useStore((state) => state);

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

  if (!userDatabaseSchema || csvColumns.length === 0) {
    return <p>É necessário carregar o JSON e o CSV primeiro.</p>;
  }

  return (
    <div>
      <h2>Mapeamento de Colunas</h2>
      {Object.entries(userDatabaseSchema).map(
        ([tableName, tableObj]: [string, any]) => (
          <div
            key={tableName}
            style={{
              marginBottom: '2rem',
              border: '1px solid #ccc',
              padding: '1rem',
            }}
          >
            <h3>{tableName}</h3>
            {tableObj.columns.map((tableCol: string) => (
              <div key={tableCol} style={{ marginBottom: '1rem' }}>
                <label style={{ marginRight: '1rem' }}>{tableCol}:</label>
                <select
                  value={currentMapping[tableName]?.[tableCol] || ''}
                  onChange={(e) =>
                    handleMap(tableName, tableCol, e.target.value)
                  }
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

      <button onClick={handleSave}>Salvar Mapeamento</button>
    </div>
  );
}
