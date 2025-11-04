import { useQuery } from '@tanstack/react-query';
import { getTableConfigs } from '../../services/tableConfigs/getTableConfigs';

export function useTableConfigs() {
  const cache = 1000 * 60 * 5; // 5 min

  return useQuery({
    queryKey: ['tableConfigs'],
    queryFn: getTableConfigs,
    staleTime: cache,
  });
}
