import { Plus, Table2 } from 'lucide-react';

import PageTitle from '../../components/PageTitle';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className='flex flex-col justify-between h-full'>
      <PageTitle title='Migrare - Dashboard' />

      <div className='flex items-center justify-center '>
        <div className='max-w-2xl w-full bg-white shadow-lg rounded-2xl p-12 text-center'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-3'>
            Bem-vindo ao <span className='font-bold'>Migrare</span>
          </h2>
          <p className='text-gray-500 mb-10'>
            Sistema de gerenciamento e migração de dados
          </p>

          {/* Quick Actions */}
          <div className='grid grid-cols-2 gap-4 mt-10'>
            <Link
              to='/migration-projects'
              className='flex flex-col items-center bg-gray-50 border border-gray-200 rounded-lg p-8 hover:bg-gray-100 hover:border-gray-300 hover:-translate-y-1 transition-all'
            >
              <div className='text-3xl mb-4 opacity-80'>
                <Plus />
              </div>
              <div className='text-sm font-medium text-gray-800 mb-2'>
                Novo Projeto
              </div>
              <div className='text-xs text-gray-500'>
                Criar projeto de migração
              </div>
            </Link>
            <Link
              to='/tables-configs'
              className='flex flex-col items-center bg-gray-50 border border-gray-200 rounded-lg p-8 hover:bg-gray-100 hover:border-gray-300 hover:-translate-y-1 transition-all'
            >
              <div className='text-3xl mb-4 opacity-80 items-center'>
                <Table2 />
              </div>
              <div className='text-sm font-medium text-gray-800 mb-2'>
                Tabelas
              </div>
              <div className='text-xs text-gray-500'>
                Configurar estrutura de destino
              </div>
            </Link>
          </div>
        </div>
      </div>
      <footer className='text-gray-500 text-sm text-center py-4 flex-shrink-0'>
        Desenvolvido por Pedro Henrique
      </footer>
    </div>
  );
}
