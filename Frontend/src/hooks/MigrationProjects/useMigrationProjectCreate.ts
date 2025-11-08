import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMigrationProject } from '../../services/migrationProjects/createMigrationProject';
import { useToastStore } from '../../store/useToastStore';
import { useNavigate } from 'react-router-dom';

export function useMigrationProjectCreate() {
  const queryClient = useQueryClient();
  const { success, error } = useToastStore();

  const navigate = useNavigate();

  return useMutation({
    mutationFn: createMigrationProject,
    onSuccess: (responseData) => {
      queryClient.invalidateQueries({ queryKey: ['migrationProjects'] });

      if (responseData.id) {
        navigate(`/migration-project/${responseData.id}`, { replace: true });
      }

      success('Projeto de migração criado com sucesso!');
    },
    onError: () => {
      error('Falha ao criar o projeto de migração!');
    },
  });
}
