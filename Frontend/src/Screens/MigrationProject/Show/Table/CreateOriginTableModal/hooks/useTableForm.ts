/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFormik } from 'formik';
import { originTableValidationSchema } from '../validationSchema';
import { useToastStore } from '../../../../../../store/useToastStore';
import type { SourceTable } from '../../../../../../store/useSourceTableStore';
import type { UseMutationResult } from '@tanstack/react-query';
import type { RequestDataProps } from '../../../../../../services/migrationProjectOriginTables/updateMigrationProjectOriginTables';

interface UseTableFormProps {
  table: SourceTable | null;
  projectId: string;
  create: UseMutationResult<
    any,
    Error,
    {
      migrationProjectId: number;
      requestData: RequestDataProps;
    },
    unknown
  >;
  update: UseMutationResult<
    any,
    Error,
    {
      migrationProjectId: number;
      id: number;
      requestData: RequestDataProps;
    },
    unknown
  >;
  updateSourceTable: (id: number, updates: SourceTable) => void;
  onClose: () => void;
  onParentHandleFormSubmit: () => void;
}

export function useTableForm({
  table,
  projectId,
  create,
  update,
  updateSourceTable,
  onClose,
  onParentHandleFormSubmit,
}: UseTableFormProps) {
  const isEditMode = !!table;
  const { error } = useToastStore();

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
            is_natural_key: col.is_natural_key,
          }))
        : [{ id: 1, name: '', type: 'text', is_natural_key: false }],
      is_pk: table ? table.columns.find((c) => c.is_pk)?.id || '' : '',
    },
    validationSchema: originTableValidationSchema,
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
        is_natural_key: col.is_natural_key,
        origin_table_id: table?.id as number,
      }));

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
      onClose();
    },
  });

  return { formik };
}
