import api from '../baseApi';

interface MigrationProjectOriginTableColumnsData {
  name: string;
  type: string;
  is_pk: boolean;
}

interface MigrationProjectOriginTableData {
  name: string;

  columns: MigrationProjectOriginTableColumnsData[];
}
interface MigrationProjectData {
  name: string;
  description: string;
  origin_tables: MigrationProjectOriginTableData[];
}

export const createMigrationProject = async (
  requestData: MigrationProjectData
) => {
  const { data } = await api.post('/migration-projects', requestData);

  return data;
};
