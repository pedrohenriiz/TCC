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
      updateSourceTable(variables.migrationProjectId, data);
      success('Tabela de origem atualizada com sucesso!');
    },
    onError: () => {
      error('Falha ao atualizar tabela de origem!');
    },
  });
}
