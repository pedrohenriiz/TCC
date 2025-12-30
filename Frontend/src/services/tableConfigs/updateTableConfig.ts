import api from '../baseApi';

export async function updateTableConfig({
  id,
  data,
}: {
  id: number;
  data: unknown;
}) {
  const { data: responseData } = await api.patch(`/table-configs/${id}`, data);

  return responseData;
}
