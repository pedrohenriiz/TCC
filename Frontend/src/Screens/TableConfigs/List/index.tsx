import React, { useState } from 'react';
import { Eye, Trash2, Plus, AlertTriangle } from 'lucide-react';
import PageHeader from '../../../components/pageHeader';
import DataTable from '../../../components/DataTable';
import { useNavigate } from 'react-router-dom';
import useTableConfigStore from '../../../store/useTableConfigsStore';

export default function TableConfigsList() {
  const navigate = useNavigate();
  const { tableConfigs, deleteTableConfig, searchTableConfigs } =
    useTableConfigStore();

  console.log(tableConfigs);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);

  // Filtro de busca (mantendo compatibilidade com a store)
  const filteredTables = searchTableConfigs(searchTerm);

  const handleView = (row) => {
    navigate(`/tables-config/${row.id}`);
  };

  const handleDeleteClick = (table) => {
    setTableToDelete(table);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteTableConfig(tableToDelete.id);
    setShowDeleteModal(false);
    setTableToDelete(null);
  };

  const columns = [
    {
      key: 'name',
      header: 'Nome da Tabela',
      accessor: (row) => row.name,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      render: (value) => (
        <span className='font-mono font-semibold text-gray-800'>{value}</span>
      ),
    },
    {
      key: 'displayName',
      header: 'Nome de Exibição',
      accessor: (row) => row.displayName,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      render: (value) => <span className='text-gray-700'>{value}</span>,
    },
    {
      key: 'columns_count',
      header: 'Colunas',
      accessor: (row) => row.columns.length,
      sortable: true,
      searchable: false,
      headerAlign: 'text-center',
      cellAlign: 'text-center',
      render: (value) => (
        <span className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium'>
          {value || 0}
        </span>
      ),
    },
    {
      key: 'foreign_keys_count',
      header: 'Relacionamentos',
      accessor: (row) => row.foreignKeys.length,
      sortable: true,
      searchable: false,
      headerAlign: 'text-center',
      cellAlign: 'text-center',
      render: (value) => {
        return (
          <span className='bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium'>
            {value} FK
          </span>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Criado em',
      accessor: (row) => row.created_at,
      sortable: true,
      searchable: false,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      render: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        return (
          <span className='text-sm text-gray-600'>
            {date.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Ações',
      accessor: () => null,
      sortable: false,
      searchable: false,
      headerAlign: 'text-center',
      cellAlign: 'text-center',
      width: '150px',
      render: (_, row) => (
        <div className='flex items-center justify-center gap-2'>
          <button
            onClick={() => handleView(row)}
            className='p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition'
            title='Visualizar detalhes'
          >
            <Eye className='w-4 h-4' />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className='p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition'
            title='Excluir tabela'
          >
            <Trash2 className='w-4 h-4' />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className='mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <PageHeader title='Configuração do Banco de Dados' />
          <button
            className='flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition'
            onClick={() => navigate(`/tables-config/new`)}
          >
            <Plus className='w-5 h-5' />
            Nova Tabela
          </button>
        </div>

        {/* Campo de busca (opcional) */}
        <div className='mb-4'>
          <input
            type='text'
            placeholder='Buscar tabela...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring focus:ring-blue-200 focus:outline-none'
          />
        </div>

        {/* Tabela */}
        <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
          <div className='overflow-x-auto'>
            <DataTable columns={columns} data={tableConfigs} />
          </div>
        </div>
      </div>

      {/* Modal de Exclusão */}
      {showDeleteModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6'>
          <div className='bg-white rounded-lg shadow-2xl max-w-md w-full p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='bg-red-100 p-3 rounded-full'>
                <AlertTriangle className='w-6 h-6 text-red-600' />
              </div>
              <h2 className='text-xl font-bold text-gray-800'>
                Confirmar Exclusão
              </h2>
            </div>

            <p className='text-gray-600 mb-2'>
              Tem certeza que deseja excluir a tabela:
            </p>
            <div className='bg-gray-50 rounded-lg p-3 mb-2'>
              <p className='font-mono font-semibold text-gray-800'>
                {tableToDelete?.table_name}
              </p>
              <p className='text-sm text-gray-600'>
                {tableToDelete?.display_name}
              </p>
            </div>

            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6'>
              <p className='text-sm text-yellow-800'>
                ⚠️ Esta ação irá excluir todas as colunas, relacionamentos e
                mapeamentos associados.{' '}
                <strong>Esta ação não pode ser desfeita.</strong>
              </p>
            </div>

            <div className='flex gap-3'>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTableToDelete(null);
                }}
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
    </>
  );
}
