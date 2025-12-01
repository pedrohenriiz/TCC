import api from '../baseApi';

export async function deleteMigrationProjectOriginTable({
  migrationProjectId,
  id,
}: {
  migrationProjectId: number;
  id: number;
}) {
  console.log(migrationProjectId, id);

  await api.delete(
    `/migration-projects/${migrationProjectId}/origin-tables/${id}`
  );
}
