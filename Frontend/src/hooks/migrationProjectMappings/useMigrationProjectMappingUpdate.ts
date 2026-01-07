import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '../../store/useToastStore';
import { updateMigrationProjectMapping } from '../../services/migrationProjectMappings/updateMigrationProjectMapping';

export function useMigrationProjectMappingUpdate() {
  const queryClient = useQueryClient();
  const { success, error } = useToastStore();

  return useMutation({
    mutationFn: updateMigrationProjectMapping,
    onSuccess: (updatedData) => {
      console.log('this', updatedData);

      queryClient.setQueryData(
        ['mappings', String(updatedData.migration_project_id)],
        (oldData: any) => {
          if (!oldData.length) {
            // Se não existe cache → cria com um array contendo o item atualizado
            return updatedData;
          }

          return oldData.map((item: any) =>
            item.id === updatedData.id ? updatedData : item
          );
        }
      );

      success('Mapeamento atualizado com sucesso!');
    },
    onError: () => {
      error('Falha ao atualizar o mapeamento!');
    },
  });
}
