import api from '../baseApi';

export async function deleteMigrationProject(id: number) {
  await api.delete(`/migration-projects/${id}`);
}
