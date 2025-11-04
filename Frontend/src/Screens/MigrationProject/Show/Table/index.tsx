import { Trash2, FileSpreadsheet, Plus, Pen } from 'lucide-react';
import { useState } from 'react';
import DataTable from '../../../../components/DataTable';
import useSourceTablesStore from '../../../../store/useSourceTableStore';
import { useParams } from 'react-router-dom';
import TableModal from './CreateOriginTableModal'; // Nome atualizado
import ConfirmButton from '../../../../components/ConfirmButton';
import EmptyTable from './EmptyTable';
import TableButton from '../../../../components/TableButton';

export default function Table() {
  const { id } = useParams() as { id: string };

  const { getSourceTablesByProject, deleteSourceTable } =
    useSourceTablesStore();

  // ✅ Estados corretos
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTable, setEditTable] = useState<any>(null);

  const sourceTables = getSourceTablesByProject(Number(id));

  const handleDelete = (table: any) => {
    if (
      window.confirm(`Tem certeza que deseja excluir a tabela "${table.name}"?`)
    ) {
      deleteSourceTable(table.id);
    }
  };

  const columns = [
    {
      name: 'name',
      header: 'Nome da Tabela',
      accessor: (row: any) => row.name,
      sortable: true,
      searchable: true,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
    },

    {
      name: 'columns',
      header: 'Colunas',
      accessor: (row: any) => row.columns.length,
      sortable: true,
      searchable: false,
      headerAlign: 'text-center',
      cellAlign: 'text-center',
      width: '100px',
    },
    {
      name: 'createdAt',
      header: 'Criado em',
      accessor: (row: any) => new Date(row.createdAt).toLocaleString('pt-BR'),
      sortable: true,
      searchable: false,
      headerAlign: 'text-left',
      cellAlign: 'text-left',
      width: '160px',
    },
    {
      name: 'actions',
      header: 'Ações',
      accessor: () => null,
      sortable: false,
      searchable: false,
      headerAlign: 'text-center',
      cellAlign: 'text-center',
      width: '100px',
      render: (_: any, row: any) => (
        <div className='flex items-center justify-center gap-2'>
          <TableButton
            variant='edit'
            Icon={<Pen className='w-4 h-4' />}
            text='Editar tabela'
            onClick={() => {
              setShowCreateModal(true);
              setEditTable(row);
            }}
          />

          <TableButton
            variant='delete'
            Icon={<Trash2 className='w-4 h-4' />}
            text='Excluir  tabela'
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
      <div className='px-6 py-5 border-b border-gray-200 bg-gray-50'>
        <div className='flex items-center justify-between text-left'>
          <div>
            <h2 className='text-lg font-semibold text-gray-900 text-left'>
              Tabelas de Origem
            </h2>
            <p className='text-sm text-gray-600 mt-1 text-left'>
              Gerencie as tabelas que serão utilizadas na migração
            </p>
          </div>

          <div className='flex items-center gap-3'>
            <ConfirmButton
              Icon={<Plus className='w-4 h-4' />}
              iconPosition='left'
              onClick={() => setShowCreateModal(true)}
              text='Adicionar tabela'
            />
          </div>
        </div>
      </div>

      <div className='px-6 py-6'>
        {sourceTables.length === 0 ? (
          <EmptyTable onCreateTableModal={() => setShowCreateModal(true)} />
        ) : (
          <DataTable columns={columns} data={sourceTables} />
        )}
      </div>

      {showCreateModal && (
        <TableModal
          isOpen={showCreateModal}
          onClose={() => {
            setEditTable(null);
            setShowCreateModal(false);
          }}
          projectId={Number(id)}
          table={editTable}
        />
      )}
    </div>
  );
}
