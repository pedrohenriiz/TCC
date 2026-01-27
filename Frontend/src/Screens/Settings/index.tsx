// pages/settings/index.tsx

import { useState } from 'react';
import MigrationSettingsTab from './MigrationSettings';
import PageHeader from '../../components/pageHeader';
import PagetTitle from '../../components/PageTitle';

export default function SettingsPage() {
  const tabs = ['Configurações de Migração'];
  const [activeTab, setActiveTab] = useState('Configurações de Migração');

  return (
    <div className='min-h-screen'>
      <div className='mx-auto bg-white shadow rounded-xl'>
        <div className='p-6'>
          <PagetTitle title='Migrare - Configurações' />
          <PageHeader title='Configurações' />
        </div>

        <div className='flex gap-6 px-8 bg-gray-50'>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className='p-8'>
          {activeTab === 'Configurações de Migração' && (
            <MigrationSettingsTab />
          )}
        </div>
      </div>
    </div>
  );
}
