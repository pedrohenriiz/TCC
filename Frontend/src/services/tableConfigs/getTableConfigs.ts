import api from '../baseApi';

export const getTableConfigs = async ({
  params = null,
}: {
  params?: {
    with_columns: boolean;
  } | null;
}) => {
  const { data } = await api.get('/table-configs', {
    params,
  });

  return data;
};
