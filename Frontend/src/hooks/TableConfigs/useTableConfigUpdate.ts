import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '../../store/useToastStore';
import { updateTableConfig } from '../../services/tableConfigs/updateTableConfig';

export function useTableConfigUpdate() {
  const queryClient = useQueryClient();

  const { success, error } = useToastStore();

  return useMutation({
    mutationFn: updateTableConfig,
    onSuccess: (updatedTable) => {
      // Atualiza o detalhe, se existir

      queryClient.setQueryData(
        ['tableConfig', String(updatedTable.id)],
        updatedTable
      );

      //   // Invalida a lista de tabelas para recarregar
      //   queryClient.invalidateQueries({
      //     queryKey: ['tableConfigs'], // ou o nome da sua query de lista
      //   });

      success('Tabela atualizada com sucesso!');
    },
    onError: () => {
      error('Falha ao atualizar a tabela!');
    },
  });
}
