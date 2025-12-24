import api from '../baseApi';

// Futuramente refatorar essas rotas
export const createMigrationProjectMapping = async ({
  migrationProjectId,
  requestData,
}) => {
  const { data } = await api.post(
    `/migration-project/${migrationProjectId}/mappings`,
    requestData
  );

  return data;
};
