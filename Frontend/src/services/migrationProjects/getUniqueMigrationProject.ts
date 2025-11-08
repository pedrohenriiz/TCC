import api from '../baseApi';

export async function getUniqueMigrationProject(id: number) {
  const { data } = await api.get(`/migration-projects/${id}`);

  return data;
}
