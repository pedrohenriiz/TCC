// hooks/useMigrationCreate.ts

import { useMutation } from '@tanstack/react-query';
import { useToastStore } from '../../store/useToastStore';
import { useMigrationStore } from '../../store/useMigrationStore';
import { createMigration } from '../../services/migration/createMigration';
import type { MigrationApiResponse } from '../../Screens/Mapping/MigrationResponse/types';

interface MigrationVariables {
  migration_project_id: string | number;
}

export function useMigrationCreate() {
  const { addToast } = useToastStore();
  const { setResult, setStatus } = useMigrationStore();

  return useMutation<MigrationApiResponse, Error, MigrationVariables>({
    mutationFn: (variables) => createMigration(variables),
    
    onMutate: () => {
      // Inicia o loading
      setStatus('loading');
    },
    
    onSuccess: (response) => {
        console.log(response)

      // Salva o resultado no store (isso vai mostrar o card)
      setResult(response.data);
      
      // Mostra toast baseado no status
      const { status, validation } = response.data;
      
      if (status === 'success') {
        addToast('Migração concluída com sucesso!', "success");
      } else if (status === 'completed_with_errors') {
        addToast(`Migração concluída com ${validation.error_count} erro(s)`, "warning");
      } else if (status === 'validation_failed') {
        addToast(`Validação falhou: ${validation.error_count} erro(s) encontrado(s)`, 'error');
      } else if (status === 'aborted') {
        addToast('Migração abortada devido a erro', "error");
      } else {
        addToast(response.data.message || 'Erro na migração', "error");
      }
    },
    
    onError: (error) => {
      console.error('Erro na migração:', error);
      
      addToast('Erro ao executar migração. Tente novamente.', 'error');      

      setStatus('error');
    },
  });
}