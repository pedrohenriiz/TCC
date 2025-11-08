import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteMigrationProject } from '../../services/migrationProjects/deleteMigrationProject';
import { useToastStore } from '../../store/useToastStore';

export function useMigrationProjectDelete() {
  const queryClient = useQueryClient();
  const { success, error } = useToastStore();

  return useMutation({
    mutationFn: deleteMigrationProject,
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        ['migrationProjects'],
        (oldData: { id: number }[]) => {
          return oldData?.filter(
            (migrationProject: { id: number }) => migrationProject.id !== id
          );
        }
      );

      success('Projeto de migração excluído com sucesso!');
    },
    onError: () => {
      error('Falha ao deletar o projeto de migração!');
    },
  });
}
