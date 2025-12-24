import PagetTitle from '../../components/PageTitle';

export default function Dashboard() {
  return (
    <div className='min-h-screen flex flex-col'>
      <PagetTitle title='Migrare - Dashboard' />

      <main className='flex-1 flex items-center justify-center px-6'>
        <div className='max-w-2xl w-full bg-white shadow-lg rounded-2xl text-center'>
          <h2 className='text-2xl font-semibold text-gray-800 '>
            Bem-vindo ao <span className='font-bold'>Migrare</span>
          </h2>
        </div>
      </main>

      <footer className='bg-gray-100 text-gray-500 text-sm text-center '>
        Desenvolvido por Pedro Henrique
      </footer>
    </div>
  );
}
