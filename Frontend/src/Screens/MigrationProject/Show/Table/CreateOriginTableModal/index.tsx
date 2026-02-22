import { Plus } from 'lucide-react';
import useSourceTablesStore, {
  type SourceTable,
} from '../../../../../store/useSourceTableStore';
import Textfield from '../../../../../components/Inputs/Textfield';
import LargeModal from '../../../../../components/LargeModal';
import ConfirmButton from '../../../../../components/ConfirmButton';
import { useMigrationProjectOriginTableCreate } from '../../../../../hooks/MigrationProjectsOriginTables/useMigrationProjectOriginTableCreate';
import { useMigrationProjectOriginTableUpdate } from '../../../../../hooks/MigrationProjectsOriginTables/useMigrationProjectOriginTableUpdate';
import { useTableForm } from './hooks/useTableForm';
import { addColumn } from './utils/addColumn';
import TableHead from './Table/TableHead';
import TableForm from './Table/TableForm';

interface TableModalProps {
  isOpen: boolean;
  projectId: number | string;
  table?: SourceTable | null; // Se passar table, é EDIÇÃO, se não passar é CRIAÇÃO
  onClose: () => void;
  onParentHandleFormSubmit: () => void;
}

export default function TableModal({
  projectId,
  table = null,
  onClose,
  onParentHandleFormSubmit,
}: TableModalProps) {
  const isEditMode = !!table;

  const create = useMigrationProjectOriginTableCreate();
  const update = useMigrationProjectOriginTableUpdate();

  const { updateSourceTable } = useSourceTablesStore();

  const { formik } = useTableForm({
    table,
    projectId,
    create,
    update,
    updateSourceTable,
    onClose,
    onParentHandleFormSubmit,
  });

  const handleAddColumn = () => {
    formik.setFieldValue('columns', addColumn(formik.values.columns));
  };

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <LargeModal
      isSubmitting={formik.isSubmitting}
      isValid={formik.isValid}
      onClose={handleClose}
      title={isEditMode ? 'Editar Tabela de Origem' : 'Criar Tabela de Origem'}
      onSubmit={formik.handleSubmit}
    >
      <form
        onSubmit={formik.handleSubmit}
        className='flex-1 overflow-y-auto p-6'
      >
        <div className='space-y-6'>
          <Textfield
            label='Nome da Tabela'
            name='name'
            placeholder='Ex: Clientes, Produtos, Pedidos'
            required
            formik={formik}
          />

          <div>
            <div className='flex items-center justify-between mb-3'>
              <label className='block text-sm font-medium text-gray-700'>
                Colunas <span className='text-red-500'>*</span>
              </label>

              <ConfirmButton
                type='button'
                onClick={handleAddColumn}
                iconPosition='left'
                Icon={<Plus className='w-4 h-4' />}
                text='Nova coluna'
                className='px-4 py-0 text-sm font-medium flex items-center'
              />
            </div>

            <div className='border border-gray-200 rounded-lg overflow-hidden'>
              <table className='w-full text-sm'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <TableHead />
                </thead>
                <tbody>
                  <TableForm formik={formik} />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </form>
    </LargeModal>
  );
}
