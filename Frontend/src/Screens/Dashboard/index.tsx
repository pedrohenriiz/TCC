import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const steps = [
    { name: 'Estrutura do Banco', path: '/upload-json' },
    { name: 'Importar CSVs', path: '/upload-csv' },
    { name: 'Mapear Campos', path: '/column-mapper' },
    { name: 'Gerar SQL', path: '/generate-sql' },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-12'>
      {steps.map((step) => (
        <button
          key={step.path}
          className={`px-6 py-4 rounded shadow font-semibold ${
            location.pathname === step.path
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700'
          }`}
          onClick={() => navigate(step.path)}
        >
          {step.name}
        </button>
      ))}
    </div>
  );
}
