import * as Yup from 'yup';

import { Database } from 'lucide-react';
import { type SourceTable } from '../../../../../store/useSourceTableStore';
import useSourceTablesStore from '../../../../../store/useSourceTableStore';
import CustomTable from './Table';
import GeneralData from './GeneralData';
import EditTableForm from './EditTableForm';
import { useFormik } from 'formik';
import { useToastStore } from '../../../../../store/useToastStore';
import LargeModal from '../../../../../components/LargeModal';

interface ViewTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: SourceTable | null;
}

export default function ViewTableModal({
  isOpen,
  onClose,
  table,
}: ViewTableModalProps) {
  const { success } = useToastStore();

  const { updateSourceTable, sourceTables } = useSourceTablesStore();

  if (!isOpen || !table) return null;

  const primaryKeyColumn = table.columns.find((col) => col.isPrimaryKey);

  //   const handleSave = () => {
  //     setError(null);

  //     // Validar nome
  //     if (!editedName.trim()) {
  //       setError('O nome da tabela não pode estar vazio');
  //       return;
  //     }

  //     // Verificar se o nome já existe em outra tabela (excluindo a atual)
  //     const otherTables = useSourceTablesStore
  //       .getState()
  //       .sourceTables.filter(
  //         (t) => t.projectId === table.projectId && t.id !== table.id
  //       );
  //     const nameExists = otherTables.some(
  //       (t) => t.name.toLowerCase() === editedName.trim().toLowerCase()
  //     );

  //     if (nameExists) {
  //       setError(
  //         `Já existe uma tabela com o nome "${editedName}". Por favor, escolha outro nome.`
  //       );
  //       return;
  //     }

  //     // Validar primary key
  //     if (!editedPrimaryKey) {
  //       setError('Por favor, selecione uma coluna como Primary Key');
  //       return;
  //     }

  //     // Atualizar colunas com a nova primary key
  //     const updatedColumns = table.columns.map((col) => ({
  //       ...col,
  //       isPrimaryKey: col.name === editedPrimaryKey,
  //     }));

  //     // Salvar alterações
  //     updateSourceTable(table.id, {
  //       name: editedName.trim(),
  //       columns: updatedColumns,
  //     });

  //     setIsEditing(false);
  //     setError(null);
  //   };

  //   const handleCancel = () => {
  //     setEditedName(table.name);
  //     const pkColumn = table.columns.find((col) => col.isPrimaryKey);
  //     setEditedPrimaryKey(pkColumn?.name || '');
  //     setError(null);
  //     setIsEditing(false);
  //   };

  //   <input
  //                     type='text'
  //                     value={editedName}
  //                     onChange={(e) => setEditedName(e.target.value)}
  //                     className='text-xl font-semibold text-gray-900 border-2 border-blue-500 rounded-lg px-3 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  //                     placeholder='Nome da tabela'
  //                   />

  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .required('Nome da tabela é obrigatório')
      .test(
        'unique-name',
        'Já existe uma tabela com esse nome',
        function (value) {
          if (!value) return true;

          // Verificar se existe outra tabela com o mesmo nome (excluindo a atual)
          const otherTables = sourceTables.filter(
            (t) => t.projectId === table.projectId && t.id !== table.id
          );

          return !otherTables.some(
            (t) => t.name.toLowerCase() === value.trim().toLowerCase()
          );
        }
      ),
    primaryKey: Yup.string().required('Selecione uma coluna como Primary Key'),
  });

  const formik = useFormik({
    initialValues: {
      name: table.name,
      primaryKey: primaryKeyColumn?.name || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) => {
      // Atualizar colunas com a nova primary key
      const updatedColumns = table.columns.map((col) => ({
        ...col,
        isPrimaryKey: col.name === values.primaryKey,
      }));

      // Salvar alterações
      updateSourceTable(table.id, {
        name: values.name.trim(),
        columns: updatedColumns,
      });

      success('Tabela atualizada com sucesso!');
      setSubmitting(false);
    },
  });

  return (
    <LargeModal
      // title={table.name}
      title='aaaaaaa'
      isSubmitting={formik.isSubmitting}
      isValid={formik.isValid}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
    >
      <div className='flex-1 overflow-y-auto p-6'>
        <div className='space-y-6'>
          <GeneralData table={table} />

          <EditTableForm table={table} formik={formik} />

          <div>
            <h3 className='text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2'>
              <Database className='w-4 h-4 text-gray-600' />
              Estrutura das Colunas ({table.columns.length})
            </h3>
            <div className='border border-gray-200 rounded-lg overflow-hidden'>
              <CustomTable data={table.columns} />
            </div>
          </div>
        </div>
      </div>
    </LargeModal>
  );
}
