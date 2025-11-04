import api from '../baseApi';

interface TableConfigColumnsData {
  name: string;
  type: string;
  size: number | null;
  is_pk: boolean | null;
  is_nullable: boolean | null;
  foreign_table_id: number | null;
  foreign_column_id: number | null;
}

interface TableConfigData {
  name: string;
  exhibition_name: string;
  columns: TableConfigColumnsData[] | null;
}

export const createTableConfigs = async (requestData: TableConfigData) => {
  const { data } = await api.post('/table-configs', requestData);

  console.log('estou aqui', data);

  return data;
};
