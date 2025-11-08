import { useQuery } from '@tanstack/react-query';

import { getMigrationProjects } from '../../services/migrationProjects/getMigrationProjects';

export function useMigrationProjects() {
  const cache = 1000 * 60 * 5; // 5 min

  return useQuery({
    queryKey: ['migrationProjects'],
    queryFn: getMigrationProjects,
    staleTime: cache,
  });
}
