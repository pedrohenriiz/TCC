import api from '../baseApi';

export interface RequestDataProps {
  id: number;
  name: string;
  columns?:
    | {
        id?: number;
        name: string;
        type: string;
        is_pk: boolean;
      }[]
    | null;
}

export async function updateMigrationProjectOriginTable({
  migrationProjectId,
  id,
  requestData,
}: {
  migrationProjectId: number;
  id: number;
  requestData: RequestDataProps;
}) {
  const { data } = await api.patch(
    `/migration-projects/${migrationProjectId}/origin-tables/${id}`,
    requestData,
  );

  return data;
}
