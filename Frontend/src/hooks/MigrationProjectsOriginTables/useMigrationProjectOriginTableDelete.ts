import { useMutation } from '@tanstack/react-query';
import { useToastStore } from '../../store/useToastStore';
import { deleteMigrationProjectOriginTable } from '../../services/migrationProjectOriginTables/deleteMigrationProjectOriginTables';
import useSourceTablesStore from '../../store/useSourceTableStore';

export function useMigrationProjectOriginTableDelete() {
  const { success, error } = useToastStore();
  const { deleteSourceTable } = useSourceTablesStore();

  return useMutation({
    mutationFn: deleteMigrationProjectOriginTable,
    onSuccess: (_, variables) => {
      console.log(variables);
      success('Tabela de origem excluída com sucesso!');

      deleteSourceTable(variables.id);
    },
    onError: () => {
      error('Falha ao deleter a tabela de origem!');
    },
  });
}
