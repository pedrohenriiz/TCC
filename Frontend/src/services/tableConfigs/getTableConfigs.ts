import api from '../baseApi';

interface GetTableConfigsProps {
  params?: {
    with_columns: boolean;
  } | null;
}

export const getTableConfigs = async ({
  params = null,
}: GetTableConfigsProps) => {
  const { data } = await api.get('/table-configs', {
    params,
  });

  return data;
};
