import { Trash2 } from 'lucide-react';
import DataTable from '../../../../components/DataTable';
import TableColumns from './TableColumns';
import { useState } from 'react';
import { useMigrationProjectDelete } from '../../../../hooks/MigrationProjects/useMigrationProjectDelete';
import ConfirmModal from '../../../../components/ConfirmModal';
import { useMigrationProjects } from '../../../../hooks/MigrationProjects/useMigrationProjectList';

export default function Table() {
  const deleteMutation = useMigrationProjectDelete();

  const { data, isLoading } = useMigrationProjects();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRow, setDeletingRow] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const handleCloseModal = () => {
    setDeletingRow(null);
    setShowDeleteModal(false);
  };

  const handleConfirmToDeleteRow = () => {
    if (deletingRow) {
      deleteMutation.mutate(deletingRow.id);
    }

    handleCloseModal();
  };

  const handleOpenDeleteModal = (row: { id: number; name: string }) => {
    setDeletingRow(row);
    setShowDeleteModal(true);
  };

  const columns = TableColumns({
    onOpenDeleteModal: handleOpenDeleteModal,
  });

  return (
    <>
      <div className='overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white'>
        <DataTable columns={columns} data={data} isLoading={isLoading} />
      </div>

      {showDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmToDeleteRow}
          title='Confirmar Exclusão'
          message='Tem certeza que deseja excluir o projeto:'
          confirmText='Excluir Projeto'
          variant='danger'
          icon={<Trash2 className='w-6 h-6' />}
          warningMessage='⚠️ Esta ação irá excluir o projeto e todas as configurações associadas (tabelas de origem, mapeamentos, etc). Esta ação não pode ser desfeita.'
          details={
            <p className='font-semibold text-gray-800'>{deletingRow?.name}</p>
          }
        />
      )}
    </>
  );
}
