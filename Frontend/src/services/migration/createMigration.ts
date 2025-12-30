import api from '../baseApi';

interface MigrationData {
  migration_project_id: string;
}

export const createMigration = async (requestData: MigrationData) => {
  await api.post(`/migrate`, {
    ...requestData,
    allow_duplicates: true,
    duplicate_strategy: 'all',
  });
};
