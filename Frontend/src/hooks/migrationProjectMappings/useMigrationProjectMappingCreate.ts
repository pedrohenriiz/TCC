import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '../../store/useToastStore';
import { createMigrationProjectMapping } from '../../services/migrationProjectMappings/createMigrationProjectMapping';

export function useMigrationProjectMappingCreate() {
  const queryClient = useQueryClient();
  const { success, error } = useToastStore();

  return useMutation({
    mutationFn: createMigrationProjectMapping,
    onSuccess: (responseData) => {
      queryClient.setQueryData(
        ['mappings', String(responseData.migration_project_id)],
        (oldData) => {
          if (!oldData) {
            return [responseData];
          }

          const list = Array.isArray(oldData) ? oldData : [];

          return [...list, responseData];
        }
      );

      success('Mapeamento criado com sucesso!');
    },
    onError: (erorr) => {
      error('Falha ao criar mapeamento!');
    },
  });
}
