import { Plus, Trash2, Edit } from 'lucide-react';
import { useSettingStore } from '../../../store/useSettingStore';
import { useState } from 'react';
import AddConfigModal from './AddConfigModal';
import Table from './Table';

// TODO: Mudar o useSettingStore para dentro da tabela
export default function DefaultColumnsTab() {
  const { columns, removeColumn, setEditing, removeEditing } =
    useSettingStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(!isModalOpen);
    removeEditing();
  };

  function handleEditRow(rowId: string) {
    setIsModalOpen(!isModalOpen);
    setEditing(rowId);
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h3 className='text-lg font-medium text-gray-800'>Colunas padrão</h3>

        <button
          onClick={() => {
            setIsModalOpen(!isModalOpen);
          }}
          className='flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
        >
          <Plus size={18} /> Nova coluna padrão
        </button>
      </div>

      <Table
        columns={columns}
        deleteRow={removeColumn}
        handleEditRow={handleEditRow}
      />

      {isModalOpen && (
        <AddConfigModal isOpen={isModalOpen} onClose={handleCloseModal} />
      )}
    </div>
  );
}
