// pages/SourceTablesConfig.jsx
import React, { useState } from 'react';
import { Upload, Edit, FileSpreadsheet, Trash2, Eye, Plus } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import useSourceTablesStore from '../../../store/useSourceTableStore';

export default function SourceTablesConfig() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { sourceTables, deleteSourceTable } = useSourceTablesStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);

  // Navegar para upload de Excel
  const handleUploadExcel = () => {
    navigate(`/migration-project/${id}/source-tables/upload`);
  };

  // Navegar para configuração manual
  const handleManualConfig = () => {
    navigate(`/migration-project/${id}/source-tables/manual/new`);
  };

  // Visualizar tabela
  const handleView = (table) => {
    navigate(`/migration-project/${id}/source-tables/${table.id}`);
  };

  // Editar tabela
  const handleEdit = (table) => {
    if (table.source === 'manual') {
      navigate(`/migration-project/${id}/source-tables/manual/${table.id}`);
    } else {
      // Tabelas do Excel não podem ser editadas diretamente
      alert(
        'Tabelas importadas do Excel não podem ser editadas. Faça upload de um novo arquivo.'
      );
    }
  };

  // Confirmar exclusão
  const handleDeleteClick = (table) => {
    setTableToDelete(table);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (tableToDelete) {
      deleteSourceTable(tableToDelete.id);
      setShowDeleteModal(false);
      setTableToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTableToDelete(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-lg shadow-lg p-6 mb-6'>
          <h1 className='text-2xl font-bold text-gray-800 mb-2'>
            📤 Configurar Tabelas de Origem
          </h1>
          <p className='text-gray-600'>
            Escolha como deseja configurar as tabelas de origem dos dados
          </p>
        </div>

        {/* Opções de Configuração */}
        {sourceTables.length === 0 ? (
          <div className='grid grid-cols-2 gap-6 mb-6'>
            {/* Opção: Upload Excel */}
            <div className='bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-blue-500'>
              <div className='text-center'>
                <div className='inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4'>
                  <FileSpreadsheet className='w-8 h-8 text-blue-600' />
                </div>
                <h3 className='text-xl font-semibold mb-2'>Upload de Excel</h3>
                <p className='text-gray-600 mb-6'>
                  Fazer upload de arquivos Excel (.xlsx, .xls, .csv)
                  <br />
                  Sistema detecta colunas automaticamente
                </p>
                <button
                  onClick={handleUploadExcel}
                  className='w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium'
                >
                  Selecionar Arquivos
                </button>
              </div>
            </div>

            {/* Opção: Manual */}
            <div className='bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-green-500'>
              <div className='text-center'>
                <div className='inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4'>
                  <Edit className='w-8 h-8 text-green-600' />
                </div>
                <h3 className='text-xl font-semibold mb-2'>
                  Configuração Manual
                </h3>
                <p className='text-gray-600 mb-6'>
                  Configurar tabelas e colunas manualmente
                  <br />
                  Controle total sobre a estrutura
                </p>
                <button
                  onClick={handleManualConfig}
                  className='w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium'
                >
                  Configurar Manualmente
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Botões quando já tem tabelas */
          <div className='bg-white rounded-lg shadow-lg p-4 mb-6'>
            <div className='flex gap-3'>
              <button
                onClick={handleUploadExcel}
                className='flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
              >
                <Upload className='w-4 h-4' />
                Upload Excel
              </button>
              <button
                onClick={handleManualConfig}
                className='flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700'
              >
                <Plus className='w-4 h-4' />
                Nova Tabela Manual
              </button>
            </div>
          </div>
        )}

        {/* Lista de Tabelas Configuradas */}
        {sourceTables.length > 0 && (
          <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
            <div className='p-6 border-b'>
              <h2 className='text-lg font-semibold'>
                📋 Tabelas de Origem Configuradas ({sourceTables.length})
              </h2>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b'>
                  <tr>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-gray-700'>
                      Nome da Tabela
                    </th>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-gray-700'>
                      Origem
                    </th>
                    <th className='px-6 py-4 text-center text-sm font-semibold text-gray-700'>
                      Colunas
                    </th>
                    <th className='px-6 py-4 text-center text-sm font-semibold text-gray-700'>
                      Registros
                    </th>
                    <th className='px-6 py-4 text-left text-sm font-semibold text-gray-700'>
                      Criado em
                    </th>
                    <th className='px-6 py-4 text-center text-sm font-semibold text-gray-700'>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {sourceTables.map((table) => (
                    <tr key={table.id} className='hover:bg-gray-50 transition'>
                      <td className='px-6 py-4'>
                        <div>
                          <div className='font-mono font-semibold text-gray-800'>
                            {table.name}
                          </div>
                          {table.fileName && (
                            <div className='text-xs text-gray-500 mt-1'>
                              Arquivo: {table.fileName}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        {table.source === 'excel' ? (
                          <span className='inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium'>
                            <FileSpreadsheet className='w-4 h-4' />
                            Excel
                          </span>
                        ) : (
                          <span className='inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium'>
                            <Edit className='w-4 h-4' />
                            Manual
                          </span>
                        )}
                      </td>
                      <td className='px-6 py-4 text-center'>
                        <span className='bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium'>
                          {table.columns?.length || 0}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-center'>
                        <span className='text-sm text-gray-600'>
                          {table.rowCount || '-'}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <span className='text-sm text-gray-600'>
                          {formatDate(table.createdAt)}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center justify-center gap-2'>
                          <button
                            onClick={() => handleView(table)}
                            className='p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition'
                            title='Visualizar'
                          >
                            <Eye className='w-4 h-4' />
                          </button>
                          {table.source === 'manual' && (
                            <button
                              onClick={() => handleEdit(table)}
                              className='p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition'
                              title='Editar'
                            >
                              <Edit className='w-4 h-4' />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(table)}
                            className='p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition'
                            title='Excluir'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Botão Continuar */}
        {sourceTables.length > 0 && (
          <div className='mt-6 flex justify-end'>
            <button
              onClick={() => navigate(`/migration-project/${id}/mapping`)}
              className='bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold'
            >
              Continuar para Mapeamento →
            </button>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6'>
          <div className='bg-white rounded-lg shadow-2xl max-w-md w-full p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='bg-red-100 p-3 rounded-full'>
                <Trash2 className='w-6 h-6 text-red-600' />
              </div>
              <h2 className='text-xl font-bold text-gray-800'>
                Confirmar Exclusão
              </h2>
            </div>

            <p className='text-gray-600 mb-2'>
              Tem certeza que deseja excluir a tabela de origem:
            </p>
            <div className='bg-gray-50 rounded-lg p-3 mb-2'>
              <p className='font-mono font-semibold text-gray-800'>
                {tableToDelete?.name}
              </p>
              {tableToDelete?.fileName && (
                <p className='text-sm text-gray-600'>
                  Arquivo: {tableToDelete.fileName}
                </p>
              )}
            </div>

            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6'>
              <p className='text-sm text-yellow-800'>
                ⚠️ Esta ação irá excluir a tabela e todos os mapeamentos
                associados.
                <strong> Esta ação não pode ser desfeita.</strong>
              </p>
            </div>

            <div className='flex gap-3'>
              <button
                onClick={cancelDelete}
                className='flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 font-medium transition'
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className='flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 font-medium transition'
              >
                Excluir Tabela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
