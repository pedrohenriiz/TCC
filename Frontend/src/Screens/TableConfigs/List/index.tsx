import { useState } from 'react';
import DataTable from '../../../components/DataTable';
import { useTableConfigs } from '../../../hooks/TableConfigs/useTableConfigList';

import tableColumns from './TableColumns';
import Header from './Header';
import DeleteTableConfigModal from './DeleteTableConfigModal';
import { useTableConfigDelete } from '../../../hooks/TableConfigs/useTableConfigDelete';
import PagetTitle from '../../../components/PageTitle';

export default function TableConfigsList() {
  const deleteMutation = useTableConfigDelete();

  const { data, isLoading } = useTableConfigs();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRowId, setDeletingRowId] = useState<number | null>(null);

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setDeletingRowId(null);
  };

  const handleOpenDeleteModal = (row: { id: number }) => {
    setDeletingRowId(row.id);
    setShowDeleteModal(true);
  };

  const handleConfirmToDeleteRow = () => {
    if (deletingRowId) {
      deleteMutation.mutate(deletingRowId);
    }
    handleCloseModal();
  };

  const columns = tableColumns({
    onOpenDeleteModal: handleOpenDeleteModal,
  });

  return (
    <>
      <div className='mx-auto'>
        <PagetTitle title='Migrare - Configuração das Tabelas' />
        <Header />

        <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
          <div className='overflow-x-auto'>
            {isLoading ? (
              <p>Carregando...</p>
            ) : (
              <DataTable columns={columns} data={data} />
            )}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteTableConfigModal
          onClose={handleCloseModal}
          onConfirm={handleConfirmToDeleteRow}
        />
      )}
    </>
  );
}
