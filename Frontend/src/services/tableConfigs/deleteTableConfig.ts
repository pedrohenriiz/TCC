import api from '../baseApi';

export async function deleteTableConfig(id: number) {
  await api.delete(`/table-configs/${id}`);
}
