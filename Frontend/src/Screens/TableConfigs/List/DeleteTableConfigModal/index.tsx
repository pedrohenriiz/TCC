import DeleteModal from '../../../../components/DeleteModal';

interface DeleteModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteTableConfigModal({
  onClose,
  onConfirm,
}: DeleteModalProps) {
  return (
    <DeleteModal
      confirmText='Excluir tabela'
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <p className='text-gray-600 mb-2'>
        Tem certeza que deseja excluir a tabela?
      </p>

      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6'>
        <p className='text-sm text-yellow-800'>
          Esta ação irá excluir todas as colunas, relacionamentos e mapeamentos
          associados. <strong>Esta ação não pode ser desfeita.</strong>
        </p>
      </div>
    </DeleteModal>
  );
}
