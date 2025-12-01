import api from '../baseApi';

export async function getUniqueTableConfig(id: number) {
  const { data } = await api.get(`/table-configs/${id}`);

  return data;
}
