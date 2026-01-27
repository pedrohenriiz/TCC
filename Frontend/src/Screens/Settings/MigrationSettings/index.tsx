// pages/settings/MigrationSettings/index.tsx

import { useSettingsList } from '../../../hooks/settings/useSettingList';
import { useSettingsUpdate } from '../../../hooks/settings/useSettingUpdate';
import { useSettingStore } from '../../../store/useSettingStore';
import { useFormik } from 'formik';
import SettingField from './SettingField';
import React from 'react';

const SETTINGS_CONFIG = [
  {
    id: 'allow_duplicates',
    label: 'Permitir Duplicatas',
    description: 'Permite registrar múltiplas chaves naturais duplicadas',
    options: [
      { value: 'true', label: 'Sim' },
      { value: 'false', label: 'Não' },
    ],
  },
  {
    id: 'duplicate_strategy',
    label: 'Estratégia para Duplicatas',
    description: 'Define qual ID usar quando houver duplicatas',
    options: [
      { value: 'first', label: 'Primeiro' },
      { value: 'last', label: 'Último' },
      { value: 'all', label: 'Todos' },
    ],
  },
];

export default function MigrationSettingsTab() {
  const { migrationSettings, isLoading } = useSettingStore();
  useSettingsList('migration'); // ✅ Busca os dados e popula a store
  const updateMutation = useSettingsUpdate();

  const formik = useFormik({
    initialValues: migrationSettings,
    enableReinitialize: true,
    onSubmit: (values) => {
      updateMutation.mutate({ settings: values });
    },
  });

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-gray-500'>Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div>
      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-6 pb-4 border-b border-gray-300'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900 text-left'>
              Configurações de Migração
            </h3>
            <p className='text-sm text-gray-600 mt-1 text-left'>
              Configure o comportamento padrão das migrações
            </p>
          </div>
          <button
            type='button'
            onClick={() => formik.handleSubmit()}
            disabled={updateMutation.isPending}
            className='px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className='space-y-6'>
          {SETTINGS_CONFIG.map((setting, index) => (
            <React.Fragment key={setting.id}>
              {index > 0 && <div className='border-t border-gray-200' />}
              <SettingField
                key={setting.id}
                id={setting.id}
                label={setting.label}
                description={setting.description}
                value={formik.values[setting.id as keyof typeof formik.values]}
                onChange={formik.handleChange}
                options={setting.options}
              />
            </React.Fragment>
          ))}
        </form>
      </div>
    </div>
  );
}
