import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '../../store/useToastStore';
import { deleteMigrationProject } from '../../services/migrationProjectMappings/deleteMigrationProjectMapping';

export function useMigrationProjectMappingDelete() {
  const queryClient = useQueryClient();
  const { success, error } = useToastStore();

  return useMutation({
    mutationFn: deleteMigrationProject,
    onSuccess: (_, data) => {
      queryClient.setQueryData(
        ['mappings', String(data.migrationProjectId)],
        (oldData: { id: number }[]) => {
          return oldData?.filter(
            (mapping: { id: number }) => mapping.id !== Number(data.id)
          );
        }
      );

      success('Mapeamento excluído com sucesso!');
    },
    onError: () => {
      error('Falha ao deletar o mapeamento!');
    },
  });
}
