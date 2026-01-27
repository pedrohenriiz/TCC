import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSettings } from '../../services/settings/updateSettings';
import { useToastStore } from '../../store/useToastStore';

export function useSettingsUpdate() {
  const queryClient = useQueryClient();
  const { success, error } = useToastStore();

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      success('Configurações salvas com sucesso!');
    },
    onError: () => {
      error('Falha ao salvar configurações!');
    },
  });
}
