import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Link, Save, ArrowLeft } from 'lucide-react';
import PageHeader from '../../../components/pageHeader';
import { useParams, useNavigate } from 'react-router-dom';
import useTableConfigStore from '../../../store/useTableConfigsStore';

export default function TableConfigsShow() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Zustand store
  const { addTableConfig, updateTableConfig, getTableConfigById } =
    useTableConfigStore();

  // Estado local da tabela atual
  const [currentTable, setCurrentTable] = useState({
    name: '',
    displayName: '',
    columns: [],
    foreignKeys: [],
  });

  const [newColumn, setNewColumn] = useState({
    name: '',
    type: 'VARCHAR',
    length: '',
    nullable: true,
    isPK: false,
    autoIncrement: false,
  });

  const dataTypes = [
    'VARCHAR',
    'INT',
    'BIGINT',
    'TEXT',
    'DATE',
    'DATETIME',
    'BOOLEAN',
    'DECIMAL',
    'FLOAT',
  ];

  // 🔹 Carregar dados quando a página abre
  useEffect(() => {
    if (id === 'new') {
      // Limpar formulário para novo cadastro
      setCurrentTable({
        name: '',
        displayName: '',
        columns: [],
        foreignKeys: [],
      });
    } else {
      // Carregar dados existentes
      const config = getTableConfigById(Number(id));
      if (config) {
        setCurrentTable({
          name: config.name || '',
          displayName: config.displayName || '',
          columns: config.columns || [],
          foreignKeys: config.foreignKeys || [],
        });
      } else {
        // ID não encontrado, redireciona para listagem
        navigate('/tables-config');
      }
    }
  }, [id, getTableConfigById, navigate]);

  // 🔹 Adicionar coluna
  const addColumn = () => {
    if (!newColumn.name) {
      alert('Digite o nome da coluna');
      return;
    }

    setCurrentTable((prev) => ({
      ...prev,
      columns: [...prev.columns, { ...newColumn, id: Date.now() }],
    }));

    // Resetar formulário de coluna
    setNewColumn({
      name: '',
      type: 'VARCHAR',
      length: '',
      nullable: true,
      isPK: false,
      autoIncrement: false,
    });
  };

  // 🔹 Remover coluna
  const removeColumn = (colId) => {
    setCurrentTable((prev) => ({
      ...prev,
      columns: prev.columns.filter((c) => c.id !== colId),
    }));
  };

  // 🔹 Adicionar chave estrangeira
  const addForeignKey = () => {
    const fk = {
      id: Date.now(),
      column: '',
      referencedTable: '',
      referencedColumn: 'id',
    };
    setCurrentTable((prev) => ({
      ...prev,
      foreignKeys: [...prev.foreignKeys, fk],
    }));
  };

  // 🔹 Atualizar chave estrangeira
  const updateForeignKey = (fkId, field, value) => {
    setCurrentTable((prev) => ({
      ...prev,
      foreignKeys: prev.foreignKeys.map((fk) =>
        fk.id === fkId ? { ...fk, [field]: value } : fk
      ),
    }));
  };

  // 🔹 Remover chave estrangeira
  const removeForeignKey = (fkId) => {
    setCurrentTable((prev) => ({
      ...prev,
      foreignKeys: prev.foreignKeys.filter((fk) => fk.id !== fkId),
    }));
  };

  // 🔹 Salvar tabela (criar ou atualizar)
  const saveTable = () => {
    if (!currentTable.name) {
      alert('Digite o nome da tabela');
      return;
    }

    if (currentTable.columns.length === 0) {
      alert('Adicione pelo menos uma coluna');
      return;
    }

    if (id === 'new') {
      // Criar novo
      const newConfig = addTableConfig(currentTable);
      alert('Tabela criada com sucesso!');
      navigate(`/tables-config/${newConfig.id}`);
    } else {
      // Atualizar existente
      updateTableConfig(Number(id), currentTable);
      alert('Tabela atualizada com sucesso!');
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
          {/* Header com botão voltar */}
          <div className='flex items-center gap-3 mb-6'>
            <button
              onClick={() => navigate('/tables-configs')}
              className='p-2 hover:bg-gray-100 rounded-lg transition'
            >
              <ArrowLeft className='w-5 h-5' />
            </button>
            <PageHeader
              title={id === 'new' ? 'Nova Tabela' : 'Editar Tabela'}
            />
          </div>

          {/* Formulário de Tabela */}
          <div className='border-2 border-dashed border-gray-300 rounded-lg p-6'>
            <h2 className='text-lg font-semibold mb-4'>
              {id === 'new' ? 'Criar Nova Tabela' : 'Editar Tabela'}
            </h2>

            {/* Informações Básicas */}
            <div className='grid grid-cols-2 gap-4 mb-6'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Nome da Tabela *
                </label>
                <input
                  type='text'
                  value={currentTable.name}
                  onChange={(e) =>
                    setCurrentTable({ ...currentTable, name: e.target.value })
                  }
                  placeholder='ex: cliente'
                  className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Nome de Exibição
                </label>
                <input
                  type='text'
                  value={currentTable.displayName}
                  onChange={(e) =>
                    setCurrentTable({
                      ...currentTable,
                      displayName: e.target.value,
                    })
                  }
                  placeholder='ex: Clientes'
                  className='w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>

            {/* Adicionar Coluna */}
            <div className='bg-blue-50 rounded-lg p-4 mb-4'>
              <h3 className='font-medium mb-3'>Adicionar Coluna</h3>
              <div className='grid grid-cols-6 gap-3 mb-3'>
                <input
                  type='text'
                  value={newColumn.name}
                  onChange={(e) =>
                    setNewColumn({ ...newColumn, name: e.target.value })
                  }
                  placeholder='Nome'
                  className='col-span-2 px-3 py-2 border rounded-lg'
                />
                <select
                  value={newColumn.type}
                  onChange={(e) =>
                    setNewColumn({ ...newColumn, type: e.target.value })
                  }
                  className='px-3 py-2 border rounded-lg'
                >
                  {dataTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <input
                  type='text'
                  value={newColumn.length}
                  onChange={(e) =>
                    setNewColumn({ ...newColumn, length: e.target.value })
                  }
                  placeholder='Tamanho'
                  className='px-3 py-2 border rounded-lg'
                />
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={newColumn.isPK}
                    onChange={(e) =>
                      setNewColumn({ ...newColumn, isPK: e.target.checked })
                    }
                  />
                  <span className='text-sm'>PK</span>
                </label>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={newColumn.nullable}
                    onChange={(e) =>
                      setNewColumn({ ...newColumn, nullable: e.target.checked })
                    }
                  />
                  <span className='text-sm'>NULL</span>
                </label>
              </div>
              <button
                onClick={addColumn}
                className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
              >
                <Plus className='w-4 h-4' />
                Adicionar Coluna
              </button>
            </div>

            {/* Lista de Colunas */}
            {currentTable.columns.length > 0 && (
              <div className='mb-4'>
                <h3 className='font-medium mb-3'>
                  Colunas ({currentTable.columns.length})
                </h3>
                <div className='space-y-2'>
                  {currentTable.columns.map((col) => (
                    <div
                      key={col.id}
                      className='flex items-center justify-between bg-white p-3 rounded-lg border'
                    >
                      <div className='flex items-center gap-4'>
                        <span className='font-mono font-medium'>
                          {col.name}
                        </span>
                        <span className='text-sm text-gray-600'>
                          {col.type}
                          {col.length && `(${col.length})`}
                        </span>
                        {col.isPK && (
                          <span className='bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs'>
                            PK
                          </span>
                        )}
                        {!col.nullable && (
                          <span className='bg-red-100 text-red-800 px-2 py-1 rounded text-xs'>
                            NOT NULL
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeColumn(col.id)}
                        className='text-red-600 hover:text-red-800'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Foreign Keys */}
            <div className='mb-4'>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='font-medium'>Chaves Estrangeiras</h3>
                <button
                  onClick={addForeignKey}
                  className='flex items-center gap-2 text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300'
                >
                  <Link className='w-4 h-4' />
                  Adicionar FK
                </button>
              </div>

              {currentTable.foreignKeys.length > 0 && (
                <div className='space-y-2'>
                  {currentTable.foreignKeys.map((fk) => (
                    <div
                      key={fk.id}
                      className='flex items-center gap-3 bg-white p-3 rounded-lg border'
                    >
                      <select
                        value={fk.column}
                        onChange={(e) =>
                          updateForeignKey(fk.id, 'column', e.target.value)
                        }
                        className='px-3 py-2 border rounded'
                      >
                        <option value=''>Selecione coluna</option>
                        {currentTable.columns.map((col) => (
                          <option key={col.id} value={col.name}>
                            {col.name}
                          </option>
                        ))}
                      </select>
                      <span>→</span>
                      <input
                        type='text'
                        value={fk.referencedTable}
                        onChange={(e) =>
                          updateForeignKey(
                            fk.id,
                            'referencedTable',
                            e.target.value
                          )
                        }
                        placeholder='Tabela referenciada'
                        className='px-3 py-2 border rounded flex-1'
                      />
                      <button
                        onClick={() => removeForeignKey(fk.id)}
                        className='text-red-600 hover:text-red-800'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className='flex items-center justify-between mt-6'>
              <button
                onClick={() => navigate('/tables-config')}
                className='px-6 py-3 border rounded-lg hover:bg-gray-50'
              >
                Cancelar
              </button>
              <button
                onClick={saveTable}
                disabled={
                  !currentTable.name || currentTable.columns.length === 0
                }
                className='flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
              >
                <Save className='w-5 h-5' />
                {id === 'new' ? 'Criar Tabela' : 'Atualizar Tabela'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
