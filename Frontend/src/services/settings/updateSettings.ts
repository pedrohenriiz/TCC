import api from '../baseApi';

export interface UpdateSettingsData {
  settings: Record<string, string>;
}

export const updateSettings = async (requestData: UpdateSettingsData) => {
  const { data } = await api.put('/settings/effective/bulk', requestData);
  return data;
};
