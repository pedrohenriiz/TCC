import api from '../baseApi';

export interface SettingEffective {
  key: string;
  value: string;
  default_value: string;
  data_type: string;
  category: string;
  description: string | null;
  allowed_values: string | null;
  is_customized: boolean;
}

export const getSettings = async (
  category?: string,
): Promise<SettingEffective[]> => {
  const params = category ? { category } : {};
  const { data } = await api.get('/settings', { params });
  return data;
};
