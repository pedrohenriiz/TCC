import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '../../store/useToastStore';
import { updateMigrationProject } from '../../services/migrationProjects/updateMigrationProject';

export function useMigrationProjectUpdate() {
  const queryClient = useQueryClient();

  const { success, error } = useToastStore();

  return useMutation({
    mutationFn: updateMigrationProject,
    onSuccess: (updatedMigrationProject) => {
      queryClient.setQueryData(
        ['migrationProject', String(updatedMigrationProject.id)],
        { data: updatedMigrationProject }
      );

      success('Projeto de migração atualizado com sucesso!');
    },
    onError: () => {
      error('Falha ao atualizar o projeto de migração!');
    },
  });
}
