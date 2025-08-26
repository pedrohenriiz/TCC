import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const navigateToUploadCSV = () => {
    navigate('/upload-csv');
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col'>
      {/* Header */}
      <header className='bg-white shadow px-6 py-4 flex justify-between items-center'>
        <h1 className='text-xl font-bold text-gray-800'>Migração de dados</h1>
      </header>

      {/* Main */}
      <main className='flex-1 flex items-center justify-center px-6'>
        <div className='max-w-2xl w-full bg-white shadow-lg rounded-2xl p-8 text-center'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-2'>
            Transforme seus CSVs em SQL
          </h2>
          <p className='text-gray-500 mb-6'>
            Faça upload de seus arquivos CSV, mapeie as colunas e gere
            automaticamente scripts SQL prontos para usar.
          </p>

          <div className='flex justify-center gap-4'>
            <button
              onClick={navigateToUploadCSV}
              className='flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition hover:cursor-pointer'
            >
              Enviar CSV
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='bg-gray-100 text-gray-500 text-sm text-center py-3'>
        Desenvolvido por Pedro Henrique
      </footer>
    </div>
  );
}
