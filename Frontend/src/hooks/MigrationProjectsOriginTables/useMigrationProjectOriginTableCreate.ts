import { useMutation } from '@tanstack/react-query';
import { useToastStore } from '../../store/useToastStore';
import { createMigrationProjectOriginTable } from '../../services/migrationProjectOriginTables/createMigrationProjectOriginTables';
import useSourceTablesStore from '../../store/useSourceTableStore';

export function useMigrationProjectOriginTableCreate() {
  const { success, error } = useToastStore();

  const { addSourceTable } = useSourceTablesStore();

  return useMutation({
    mutationFn: createMigrationProjectOriginTable,
    onSuccess: (data, variables) => {
      addSourceTable(variables.migrationProjectId, data);
      success('Tabela de origem criada com sucesso!');
    },
    onError: () => {
      error('Falha ao criar tabela de origem!');
    },
  });
}
