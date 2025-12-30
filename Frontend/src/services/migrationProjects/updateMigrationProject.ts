import api from '../baseApi';

export async function updateMigrationProject({
  id,
  data,
}: {
  id: number;
  data: unknown;
}) {
  const { data: responseData } = await api.patch(
    `/migration-projects/${id}`,
    data
  );

  return responseData;
}
