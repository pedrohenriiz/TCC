import api from '../baseApi';
import type { MigrationApiResponse } from '../../Screens/Mapping/MigrationResponse/types';

interface MigrationData {
  migration_project_id: string | number;
  allow_duplicates?: boolean;
  duplicate_strategy?: 'first' | 'last' | 'all';
}

export const createMigration = async (
  requestData: MigrationData
): Promise<MigrationApiResponse> => {
  const response = await api.post<MigrationApiResponse>('/migrate', {
    migration_project_id: requestData.migration_project_id,
    allow_duplicates: requestData.allow_duplicates ?? true,
    duplicate_strategy: requestData.duplicate_strategy ?? 'all',
  });
  
  return response.data;
};