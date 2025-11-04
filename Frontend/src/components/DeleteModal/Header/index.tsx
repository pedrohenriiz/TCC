import { AlertTriangle } from 'lucide-react';

export default function Header() {
  return (
    <div className='flex items-center flex-col gap-3 mb-4'>
      <div className='bg-red-100 p-3 rounded-full'>
        <AlertTriangle className='w-8 h-8 text-red-600' />
      </div>
      <h2 className='text-xl font-bold text-gray-800'>Confirmar Exclusão</h2>
    </div>
  );
}
