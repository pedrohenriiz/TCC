import { Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import DataTable from '../../../../components/DataTable';
import useSourceTablesStore, {
  type SourceTableColumnProps,
} from '../../../../store/useSourceTableStore';
import { useParams } from 'react-router-dom';
import TableModal from './CreateOriginTableModal'; // Nome atualizado
import ConfirmButton from '../../../../components/ConfirmButton';
import EmptyTable from './EmptyTable';
import ConfirmModal from '../../../../components/ConfirmModal';
import { useMigrationProjectOriginTableDelete } from '../../../../hooks/MigrationProjectsOriginTables/useMigrationProjectOriginTableDelete';
import TableColumns from './TableColumns';

interface TableProps {
  onParentHandleFormSubmit: () => void;
}

export interface RowProps {
  id: number;
  name: string;
  migration_project_id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  columns: SourceTableColumnProps[];
}

export default function Table({ onParentHandleFormSubmit }: TableProps) {
  const { id } = useParams() as { id: string };

  const deleteMutation = useMigrationProjectOriginTableDelete();

  const { getSourceTablesByProject } = useSourceTablesStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRow, setDeletingRow] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [editTable, setEditTable] = useState<RowProps | null>(null);

  const sourceTables = getSourceTablesByProject();

  const handleCloseModal = () => {
    setDeletingRow(null);
    setShowDeleteModal(false);
  };

  const handleConfirmToDeleteRow = () => {
    if (deletingRow) {
      deleteMutation.mutate({
        id: deletingRow.id,
        migrationProjectId: Number(id),
      });
    }

    handleCloseModal();
  };

  const handleOpenCreateModal = (row: RowProps) => {
    setShowCreateModal(true);

    setEditTable(row);
  };

  const handleOpenDeleteModal = (row: RowProps) => {
    setDeletingRow({ id: row.id, name: row.name });
    setShowDeleteModal(true);
  };

  const columns = TableColumns({
    onOpenCreateModal: handleOpenCreateModal,
    onOpenDeleteModal: handleOpenDeleteModal,
  });

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
          onParentHandleFormSubmit={onParentHandleFormSubmit}
          projectId={Number(id)}
          table={editTable}
        />
      )}

      {showDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmToDeleteRow}
          title='Confirmar Exclusão'
          message='Tem certeza que deseja excluir a tabela de origem?'
          confirmText='Excluir'
          variant='danger'
          icon={<Trash2 className='w-6 h-6' />}
          warningMessage='⚠️ Esta ação irá excluir a tabela de origem e todas as configurações associadas (colunas mapeadas). Esta ação não pode ser desfeita.'
          details={
            <p className='font-semibold text-gray-800'>{deletingRow?.name}</p>
          }
        />
      )}
    </div>
  );
}
