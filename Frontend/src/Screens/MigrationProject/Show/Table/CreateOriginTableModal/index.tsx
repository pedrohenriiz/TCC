import { useState, useEffect } from 'react';
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

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  table?: SourceTable | null; // Se passar table, é EDIÇÃO, se não passar é CRIAÇÃO
}

interface Column {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean';
}

export default function TableModal({
  isOpen,
  onClose,
  projectId,
  table = null,
}: TableModalProps) {
  const isEditMode = !!table;

  const [columns, setColumns] = useState<Column[]>([
    { id: '1', name: '', type: 'text' },
  ]);
  const [primaryKeyColumn, setPrimaryKeyColumn] = useState<string>('');

  const {
    addManualSourceTable,
    updateSourceTable,
    tableNameExists,
    sourceTables,
  } = useSourceTablesStore();
  const { success } = useToastStore();

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
            const otherTables = sourceTables.filter(
              (t) => t.projectId === projectId && t.id !== table.id
            );
            return !otherTables.some(
              (t) => t.name.toLowerCase() === value.trim().toLowerCase()
            );
          }

          // No modo criação, verificar todas as tabelas
          return !tableNameExists(value.trim(), projectId);
        }
      ),
  });

  const formik = useFormik({
    initialValues: {
      name: table?.name || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) => {
      // Validar colunas
      const hasEmptyColumns = columns.some((col) => !col.name.trim());
      if (hasEmptyColumns) {
        alert('Todos os nomes de colunas são obrigatórios');
        setSubmitting(false);
        return;
      }

      // Validar nomes duplicados
      const columnNames = columns.map((col) => col.name.trim().toLowerCase());
      const hasDuplicates = columnNames.length !== new Set(columnNames).size;
      if (hasDuplicates) {
        alert('Não pode haver colunas com nomes duplicados');
        setSubmitting(false);
        return;
      }

      // Validar primary key
      if (!primaryKeyColumn) {
        alert('Selecione uma coluna como Primary Key');
        setSubmitting(false);
        return;
      }

      // Preparar colunas
      const formattedColumns = columns.map((col, index) => ({
        id: col.id,
        name: col.name.trim(),
        type: col.type,
        originalIndex: index,
        isPrimaryKey: col.id === primaryKeyColumn,
      }));

      if (isEditMode && table) {
        // EDITAR tabela existente
        updateSourceTable(table.id, {
          name: values.name.trim(),
          columns: formattedColumns,
        });
        success('Tabela atualizada com sucesso!');
      } else {
        // CRIAR nova tabela
        addManualSourceTable(projectId, values.name.trim(), formattedColumns);
        success('Tabela criada com sucesso!');
      }

      setSubmitting(false);
      handleClose();
    },
  });

  // Carregar dados da tabela quando for modo de edição
  useEffect(() => {
    if (isEditMode && table && isOpen) {
      const loadedColumns = table.columns.map((col) => ({
        id: col.id,
        name: col.name,
        type: col.type as 'text' | 'number' | 'date' | 'boolean',
      }));
      setColumns(loadedColumns);

      const pkColumn = table.columns.find((col) => col.isPrimaryKey);
      setPrimaryKeyColumn(pkColumn?.id || '');
    } else if (!isEditMode && isOpen) {
      // Modo criação - resetar tudo
      setColumns([{ id: '1', name: '', type: 'text' }]);
      setPrimaryKeyColumn('');
    }
  }, [isEditMode, table, isOpen]);

  const handleAddColumn = () => {
    const maxId =
      columns.length > 0
        ? Math.max(
            ...columns.map((c) => {
              const numId = parseInt(c.id.replace('col_', ''));
              return isNaN(numId) ? parseInt(c.id) : numId;
            })
          )
        : 0;
    const newId = `col_${maxId + 1}`;
    setColumns([...columns, { id: newId, name: '', type: 'text' }]);
  };

  const handleRemoveColumn = (id: string) => {
    if (columns.length === 1) {
      alert('A tabela deve ter pelo menos uma coluna');
      return;
    }
    setColumns(columns.filter((col) => col.id !== id));
    if (primaryKeyColumn === id) {
      setPrimaryKeyColumn('');
    }
  };

  const handleColumnNameChange = (id: string, name: string) => {
    setColumns(columns.map((col) => (col.id === id ? { ...col, name } : col)));
  };

  const handleColumnTypeChange = (id: string, type: Column['type']) => {
    setColumns(columns.map((col) => (col.id === id ? { ...col, type } : col)));
  };

  const handleClose = () => {
    formik.resetForm();
    setColumns([{ id: '1', name: '', type: 'text' }]);
    setPrimaryKeyColumn('');
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
                  {columns.map((column) => (
                    <tr
                      key={column.id}
                      className={`border-b border-gray-100 ${
                        primaryKeyColumn === column.id
                          ? 'bg-green-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Nome */}
                      <td className='px-4 py-3'>
                        <input
                          type='text'
                          value={column.name}
                          onChange={(e) =>
                            handleColumnNameChange(column.id, e.target.value)
                          }
                          placeholder='Ex: id, nome, email'
                          className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        />
                      </td>

                      {/* Tipo */}
                      <td className='px-4 py-3'>
                        <select
                          value={column.type}
                          onChange={(e) =>
                            handleColumnTypeChange(
                              column.id,
                              e.target.value as Column['type']
                            )
                          }
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
                          name='primaryKey'
                          checked={primaryKeyColumn === column.id}
                          onChange={() => setPrimaryKeyColumn(column.id)}
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
