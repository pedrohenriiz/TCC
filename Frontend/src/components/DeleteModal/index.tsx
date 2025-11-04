import Footer from './Footer';
import Header from './Header';

interface DeleteModalProps {
  children: React.ReactNode;
  confirmText: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({
  children,
  confirmText,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  return (
    <div
      className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-lg shadow-2xl max-w-md w-full p-6'
        onClick={(e) => e.stopPropagation()}
      >
        <Header />

        {children}

        {/* <p className='text-gray-600 mb-2'>
          Tem certeza que deseja excluir a tabela:
        </p>
        <div className='bg-gray-50 rounded-lg p-3 mb-2'>
          <p className='font-mono font-semibold text-gray-800'>
            {tableToDelete?.table_name}
          </p>
          <p className='text-sm text-gray-600'>{tableToDelete?.display_name}</p>
        </div>

        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6'>
          <p className='text-sm text-yellow-800'>
            ⚠️ Esta ação irá excluir todas as colunas, relacionamentos e
            mapeamentos associados.{' '}
            <strong>Esta ação não pode ser desfeita.</strong>
          </p>
        </div> */}

        <Footer
          confirmText={confirmText}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      </div>
    </div>
  );
}
