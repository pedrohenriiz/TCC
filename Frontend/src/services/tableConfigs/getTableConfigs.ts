import api from '../baseApi';

export const getTableConfigs = async () => {
  const { data } = await api.get('/table-configs');

  return data;
};
