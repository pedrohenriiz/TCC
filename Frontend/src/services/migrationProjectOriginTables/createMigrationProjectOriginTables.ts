import api from '../baseApi';

interface RequestDataProps {
  name: string;
  columns?:
    | {
        name: string;
        type: string;
        is_pk: boolean;
      }[]
    | null;
}

export async function createMigrationProjectOriginTable({
  migrationProjectId,
  requestData,
}: {
  migrationProjectId: number;
  requestData: RequestDataProps;
}) {
  const { data } = await api.post(
    `/migration-projects/${migrationProjectId}/origin-tables`,
    requestData
  );

  return data;
}
