import api from '../baseApi';

export async function getUniqueTableConfig(id: number) {
  const data = api.get(`/table-configs/${id}`);

  return data;
}
