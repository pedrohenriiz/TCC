import api from '../baseApi';

export async function updateMigrationProjectMapping({
  migrationProjectId,
  id,
  data,
}: {
  migrationProjectId: number;
  id: number;
  data: {
    name: string;
    status: string;
    id: number;
    migration_project_id: number;
    columns?: {
      id?: number;
      origin_table_id: number;
      origin_column_id: number;
      destiny_table_id: number;
      destiny_column_id: number;
    }[];
  };
}) {
  const response = await api.patch(
    `/migration-project/${migrationProjectId}/mappings/${id}`,
    data
  );

  return response.data;
}
