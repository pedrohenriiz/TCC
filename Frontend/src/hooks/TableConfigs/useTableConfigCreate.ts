import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTableConfigs } from '../../services/tableConfigs/createTableConfig';
import { useToastStore } from '../../store/useToastStore';
import { useNavigate } from 'react-router-dom';

export function useTableConfigCreate() {
  const queryClient = useQueryClient();
  const { success, error } = useToastStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createTableConfigs,
    onSuccess: (responseData) => {
      queryClient.invalidateQueries({ queryKey: ['tableConfigs'] });

      if (responseData.id) {
        navigate(`/tables-config/${responseData.id}`, { replace: true });
      }

      success('Tabela criada com sucesso!');
    },
    onError: () => {
      error('Falha ao criar tabela!');
    },
  });
}
