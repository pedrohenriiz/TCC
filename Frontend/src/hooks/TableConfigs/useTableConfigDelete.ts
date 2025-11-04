import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTableConfig } from '../../services/tableConfigs/deleteTableConfig';
import { useToastStore } from '../../store/useToastStore';

export function useTableConfigDelete() {
  const queryClient = useQueryClient();
  const { success, error } = useToastStore();

  return useMutation({
    mutationFn: deleteTableConfig,
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        ['tableConfigs'],
        (oldData: { id: number }[]) => {
          return oldData?.filter(
            (tableConfig: { id: number }) => tableConfig.id !== id
          );
        }
      );

      success('Tabela excluída com sucesso!');
    },
    onError: () => {
      error('Falha ao deletar tabela!');
    },
  });
}
