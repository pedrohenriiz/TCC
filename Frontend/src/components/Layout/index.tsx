import { Link, Outlet, useLocation } from 'react-router-dom';
import { Table, DatabaseBackup, Cog } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const menu = [
    {
      path: '/migration-projects',
      name: 'Projetos de migração',
      Icon: DatabaseBackup,
    },
    {
      path: '/tables-configs',
      name: 'Configurações de tabelas',
      Icon: Table,
    },
    {
      path: '/settings',
      name: 'Configurações',
      Icon: Cog,
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
              key={path}
            >
              <Icon className='w-5 h-5 mr-2' />
              {name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Área principal */}
      <div className='flex-1 flex flex-col'>
        <div className='py-6 bg-white'></div>
        {/* Conteúdo da rota */}
        <main className='flex-1 p-6 overflow-auto'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
