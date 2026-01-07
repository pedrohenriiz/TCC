import { Plus, Trash2 } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import useSourceTablesStore, {
  type SourceTable,
} from '../../../../../store/useSourceTableStore';
import Textfield from '../../../../../components/Inputs/Textfield';
import { useToastStore } from '../../../../../store/useToastStore';
import LargeModal from '../../../../../components/LargeModal';
import ConfirmButton from '../../../../../components/ConfirmButton';
import { useMigrationProjectOriginTableCreate } from '../../../../../hooks/MigrationProjectsOriginTables/useMigrationProjectOriginTableCreate';
import { useMigrationProjectOriginTableUpdate } from '../../../../../hooks/MigrationProjectsOriginTables/useMigrationProjectOriginTableUpdate';

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
  const { error } = useToastStore();

  const isEditMode = !!table;

  const create = useMigrationProjectOriginTableCreate();
  const update = useMigrationProjectOriginTableUpdate();

  const { updateSourceTable, tableNameExists, sourceTables } =
    useSourceTablesStore();

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

          if (isEditMode && table) {
            // No modo edição, verificar outras tabelas exceto a atual
            // TODO: Testar esse filter
            const otherTables = sourceTables.filter(
              (t) =>
                t.migration_project_id === Number(projectId) &&
                t.id !== table.id
            );
            return !otherTables.some(
              (t) => t.name.toLowerCase() === value.trim().toLowerCase()
            );
          }

          // No modo criação, verificar todas as tabelas
          return !tableNameExists(value.trim(), Number(projectId));
        }
      ),
  });

  const formik = useFormik({
    initialValues: {
      id: table?.id || '',
      name: table?.name || '',
      migration_project_id: table?.migration_project_id || '',
      columns: table
        ? table.columns.map((col) => ({
            id: col.id,
            name: col.name,
            type: col.type,
          }))
        : [{ id: 1, name: '', type: 'text' }],
      is_pk: table ? table.columns.find((c) => c.is_pk)?.id || '' : '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) => {
      const { columns, is_pk } = values;

      const hasEmptyColumns = columns.some((col) => !col.name.trim());
      if (hasEmptyColumns) {
        error('Todos os nomes de colunas são obrigatórios');
        setSubmitting(false);
        return;
      }

      const columnNames = columns.map((col) => col.name.trim().toLowerCase());
      const hasDuplicates = columnNames.length !== new Set(columnNames).size;
      if (hasDuplicates) {
        error('Não pode haver colunas com nomes duplicados');
        setSubmitting(false);
        return;
      }

      if (!is_pk) {
        error('Selecione uma coluna como Primary Key');
        setSubmitting(false);
        return;
      }

      const formattedColumns = columns.map((col) => ({
        id: typeof col.id === 'number' ? col.id : undefined,
        name: col.name.trim(),
        type: col.type,
        is_pk: col.id === is_pk,
        origin_table_id: table?.id as number,
      }));

      console.log('formattedColumns', formattedColumns);

      if (isEditMode && table) {
        update.mutate({
          id: Number(values.id),
          migrationProjectId: Number(projectId),
          requestData: {
            id: Number(values.id),
            name: values.name.trim(),
            columns: formattedColumns,
          },
        });

        updateSourceTable(table.id, {
          id: Number(values.id),
          migration_project_id: Number(values.migration_project_id),
          name: values.name.trim(),
          columns: formattedColumns,
        });
      } else {
        if (projectId === 'new') {
          onParentHandleFormSubmit();
        } else {
          create.mutate({
            migrationProjectId: Number(projectId),
            requestData: {
              name: values.name.trim(),
              columns: formattedColumns,
            },
          });
        }
      }

      setSubmitting(false);
      handleClose();
    },
  });

  const handleAddColumn = () => {
    const newId = `col_${formik.values.columns.length + 1}`;
    formik.setFieldValue('columns', [
      ...formik.values.columns,
      { id: newId, name: '', type: 'text' },
    ]);
  };

  const handleRemoveColumn = (id?: number) => {
    const newColumns = formik.values.columns.filter((c) => c.id !== id);

    if (formik.values.is_pk === id) {
      formik.setFieldValue('primaryKey', '');
    }

    formik.setFieldValue('columns', newColumns);
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
          {/* Nome da Tabela */}
          <Textfield
            label='Nome da Tabela'
            name='name'
            placeholder='Ex: Clientes, Produtos, Pedidos'
            helpText='Escolha um nome descritivo para a tabela'
            required
            formik={formik}
          />

          {/* Colunas */}
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

            {/* Tabela de Colunas */}
            <div className='border border-gray-200 rounded-lg overflow-hidden'>
              <table className='w-full text-sm'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    <th className='px-4 py-3 text-left font-semibold text-gray-700 w-[40%]'>
                      Nome da Coluna
                    </th>
                    <th className='px-4 py-3 text-left font-semibold text-gray-700 w-[30%]'>
                      Tipo
                    </th>
                    <th className='px-4 py-3 text-center font-semibold text-gray-700 w-[15%]'>
                      PK
                    </th>
                    <th className='px-4 py-3 text-center font-semibold text-gray-700 w-[15%]'>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formik.values.columns.map((column) => (
                    <tr
                      key={column.id}
                      className={`border-b border-gray-100 ${
                        formik.values.is_pk === column.id
                          ? 'bg-green-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Nome */}
                      <td className='px-4 py-3'>
                        <input
                          type='text'
                          value={column.name}
                          onChange={(e) => {
                            const newColumns = [...formik.values.columns];
                            const index = newColumns.findIndex(
                              (c) => c.id === column.id
                            );
                            newColumns[index].name = e.target.value;
                            formik.setFieldValue('columns', newColumns);
                          }}
                          placeholder='Ex: id, nome, email'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                      </td>

                      {/* Tipo */}
                      <td className='px-4 py-3'>
                        <select
                          value={column.type}
                          onChange={(e) => {
                            const newColumns = [...formik.values.columns];
                            const index = newColumns.findIndex(
                              (c) => c.id === column.id
                            );
                            newColumns[index].type = e.target.value;
                            formik.setFieldValue('columns', newColumns);
                          }}
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        >
                          <option value='text'>Texto</option>
                          <option value='number'>Número</option>
                          <option value='date'>Data</option>
                          <option value='boolean'>Booleano</option>
                        </select>
                      </td>

                      {/* Primary Key */}
                      <td className='px-4 py-3 text-center'>
                        <input
                          type='radio'
                          name='is_pk'
                          checked={formik.values.is_pk === column.id}
                          onChange={() =>
                            formik.setFieldValue('is_pk', column.id)
                          }
                          className='w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer'
                          title='Definir como Primary Key'
                        />
                      </td>

                      {/* Ações */}
                      <td className='px-4 py-3 text-center'>
                        <button
                          type='button'
                          onClick={() => handleRemoveColumn(column.id)}
                          className='p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition inline-flex hover:cursor-pointer'
                          title='Remover coluna'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </form>
    </LargeModal>
  );
}
