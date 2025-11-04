import Header from './Header';
import Form from './Form';
import Table from './Table';
import { CheckCircle2, Settings } from 'lucide-react';
import ConfirmButton from '../../../components/ConfirmButton';

export default function ProjectForm() {
  return (
    <div className='min-h-screen '>
      <div className=' mx-auto'>
        <Header />

        <Form />

        {/* Card de Próximos Passos */}
        <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 mb-6 mt-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 bg-blue-600 rounded-lg'>
              <CheckCircle2 className='w-5 h-5 text-white' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900 text-left'>
                Próximos Passos
              </h3>
              <p className='text-sm text-gray-600 mt-0.5'>
                Após criar o projeto, você poderá:
              </p>
            </div>
          </div>

          <ul className='space-y-2.5 ml-14'>
            <li className='flex items-start gap-2 text-sm text-gray-700'>
              <span className='w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0'></span>
              <span>Configurar as tabelas de origem</span>
            </li>
            <li className='flex items-start gap-2 text-sm text-gray-700'>
              <span className='w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0'></span>
              <span>Definir o mapeamento entre origem e destino</span>
            </li>
            <li className='flex items-start gap-2 text-sm text-gray-700'>
              <span className='w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0'></span>
              <span>Executar a migração dos dados</span>
            </li>
          </ul>
        </div>

        <Table />

        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6'>
          <div className='px-6 py-5 border-b border-gray-200 bg-gray-50'>
            <div className='flex items-center justify-between text-left'>
              <div>
                <h2 className='text-lg font-semibold text-gray-900 text-left'>
                  Configurar de-para
                </h2>
                <p className='text-sm text-gray-600 mt-1 text-left'>
                  Configure o relacionamento entre as tabelas de origem e
                  destino
                </p>
              </div>

              <div className='flex items-center gap-3'>
                <ConfirmButton
                  Icon={<Settings className='w-4 h-4' />}
                  iconPosition='left'
                  // onClick={() => setShowCreateModal(true)}
                  text='Configurar'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
