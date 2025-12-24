import api from '../baseApi';

export async function deleteMigrationProject({
  id,
  migrationProjectId,
}: {
  id: number;
  migrationProjectId: number;
}) {
  await api.delete(`/migration-project/${migrationProjectId}/mappings/${id}`);
}
