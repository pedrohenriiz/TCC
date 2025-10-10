import { Link, Outlet, useLocation } from 'react-router-dom';
import { Settings, Database } from 'lucide-react';
import Header from '../Header';

export default function Layout() {
  const location = useLocation();

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Sidebar */}
      <aside className='w-60 text-white flex flex-col bg-main'>
        <div className='px-6 py-4 text-lg font-bold border-b border-tertiary'>
          <Link to='/'>Migrare</Link>
        </div>
        <nav className='flex-1 p-4 space-y-2'>
          <Link
            to='/settings'
            className={`flex items-center w-full p-2 rounded hover:bg-secondary ${
              location.pathname === '/settings' ? 'bg-secondary' : ''
            }`}
          >
            <Settings className='w-5 h-5 mr-2' />
            Configurações
          </Link>

          <Link
            to='/tipos'
            className={`flex items-center w-full p-2 rounded hover:bg-secondary ${
              location.pathname === '/tipos' ? 'bg-secondary' : ''
            }`}
          >
            <Database className='w-5 h-5 mr-2' />
            Tipos de Dados
          </Link>
        </nav>
      </aside>

      {/* Área principal */}
      <div className='flex-1 flex flex-col'>
        <Header />
        {/* Conteúdo da rota */}
        <main className='flex-1 p-6 overflow-auto'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
