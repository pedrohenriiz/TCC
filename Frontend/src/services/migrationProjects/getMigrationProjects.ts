import api from '../baseApi';

export const getMigrationProjects = async () => {
  const { data } = await api.get('/migration-projects');

  return data;
};
