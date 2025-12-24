import { useState } from 'react';
import DefaultColumnsTab from './DefaultSettings';
import PageHeader from '../../components/pageHeader';
import PagetTitle from '../../components/PageTitle';

export default function SettingsPage() {
  const tabs = ['Colunas padrão'];
  const [activeTab, setActiveTab] = useState('Colunas padrão');

  return (
    <div className='min-h-screen '>
      <div className=' mx-auto bg-white shadow rounded-xl'>
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

        {/* Conteúdo */}
        <div className='p-8'>
          {activeTab === 'Colunas padrão' && <DefaultColumnsTab />}
        </div>
      </div>
    </div>
  );
}

function AccountForm() {
  return (
    <div className='text-gray-600'>
      <p>Aqui você pode alterar as informações da sua conta.</p>
    </div>
  );
}

function SecurityForm() {
  return (
    <div className='text-gray-600'>
      <p>
        Aqui você pode alterar senha e configurar autenticação em dois fatores.
      </p>
    </div>
  );
}

function PaymentForm() {
  return (
    <form className='space-y-6'>
      <div>
        <label className='block text-sm font-medium text-gray-700'>
          Número do Cartão
        </label>
        <input
          type='text'
          placeholder='0000 0000 0000 0000'
          className='mt-1 w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        />
      </div>
      <div className='grid grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Validade
          </label>
          <input
            type='text'
            placeholder='MM/AA'
            className='mt-1 w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700'>CVV</label>
          <input
            type='text'
            placeholder='***'
            className='mt-1 w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>
      </div>
      <div className='flex justify-end'>
        <button
          type='submit'
          className='px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
        >
          Salvar cartão
        </button>
      </div>
    </form>
  );
}
