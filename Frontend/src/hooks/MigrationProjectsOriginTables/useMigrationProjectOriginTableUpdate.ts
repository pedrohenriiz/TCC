import { useMutation } from '@tanstack/react-query';
import useSourceTablesStore from '../../store/useSourceTableStore';
import { useToastStore } from '../../store/useToastStore';
import { updateMigrationProjectOriginTable } from '../../services/migrationProjectOriginTables/updateMigrationProjectOriginTables';

export function useMigrationProjectOriginTableUpdate() {
  const { success, error } = useToastStore();

  const { updateSourceTable } = useSourceTablesStore();

  return useMutation({
    mutationFn: updateMigrationProjectOriginTable,
    onSuccess: (data, variables) => {
      console.log(data);

      updateSourceTable(table.id, {
        name: values.name.trim(),
        columns: formattedColumns,
      });
    },
    onError: () => {
      error('Falha ao atualizar tabela de origem!');
    },
  });
}
