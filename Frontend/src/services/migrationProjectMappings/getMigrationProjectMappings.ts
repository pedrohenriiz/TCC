import api from '../baseApi';

export const getMigrationProjectMappings = async (
  migrationProjectId: number
) => {
  const { data } = await api.get(
    `/migration-project/${migrationProjectId}/mappings`
  );

  return data;
};
