import type { ColumnProps } from '../../Screens/TableConfigs/Show/types';
import api from '../baseApi';

interface ResponseDataProps {
  id: number;
  columns: ColumnProps[];
  name: string;
  exhibition_name: string;
}

export const getTableConfigs = async ({
  params = null,
}: {
  params?: {
    with_columns: boolean;
  } | null;
}) => {
  const { data } = await api.get<ResponseDataProps[]>('/table-configs', {
    params,
  });

  return data;
};
