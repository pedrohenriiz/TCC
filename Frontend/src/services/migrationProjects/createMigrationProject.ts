import api from '../baseApi';

interface MigrationProjectData {
  name: string;
  description: string;
}

export const createMigrationProject = async (
  requestData: MigrationProjectData
) => {
  const { data } = await api.post('/migration-projects', requestData);

  return data;
};
