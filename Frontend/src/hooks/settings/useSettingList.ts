// hooks/settings/useSettingsQuery.ts

import { useQuery } from '@tanstack/react-query';
import { getSettings } from '../../services/settings/getSettings';
import { useSettingStore } from '../../store/useSettingStore';
import { useEffect } from 'react';

export function useSettingsList(category?: string) {
  const { setMigrationSettings, setLoading, setError } = useSettingStore();

  const query = useQuery({
    queryKey: ['settings', category],
    queryFn: () => getSettings(category),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Atualiza a store quando os dados chegam
  useEffect(() => {
    if (query.data) {
      const settingsMap = query.data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);

      setMigrationSettings({
        allow_duplicates: settingsMap.allow_duplicates || 'false',
        duplicate_strategy: settingsMap.duplicate_strategy || 'first',
      });
    }

    setLoading(query.isLoading);
    setError(query.error?.message || null);
  }, [
    query.data,
    query.isLoading,
    query.error,
    setMigrationSettings,
    setLoading,
    setError,
  ]);

  return query;
}
