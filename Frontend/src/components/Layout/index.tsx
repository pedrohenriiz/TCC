import { Link, Outlet, useLocation } from 'react-router-dom';
import { Settings, Database, Table, DatabaseBackup } from 'lucide-react';
import Header from '../Header';

export default function Layout() {
  const location = useLocation();

  const menu = [
    {
      path: '/settings',
      name: 'Configurações',
      Icon: Settings,
    },
    {
      path: '/tipos',
      name: 'Tipos de dados',
      Icon: Database,
    },
    {
      path: '/tables-configs',
      name: 'Configurações de tabelas',
      Icon: Table,
    },
    {
      path: '/migration-project',
      name: 'Projetos de migração',
      Icon: DatabaseBackup,
    },
  ];

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Sidebar */}
      <aside className='w-60 text-white flex flex-col bg-main'>
        <div className='px-6 py-4 text-lg font-bold border-b border-tertiary'>
          <Link to='/'>Migrare</Link>
        </div>
        <nav className='flex-1 p-4 space-y-2'>
          {menu.map(({ Icon, path, name }) => (
            <Link
              to={path}
              className={`flex items-center text-left w-full p-2 rounded hover:bg-secondary ${
                location.pathname === path ? 'bg-secondary' : ''
              }`}
            >
              <Icon className='w-5 h-5 mr-2' />
              {name}
            </Link>
          ))}
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
