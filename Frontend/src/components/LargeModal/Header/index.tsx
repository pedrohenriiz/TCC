import { X } from 'lucide-react';

interface HeaderProps {
  title: string;
  handleClose: () => void;
}

export default function Header({ title, handleClose }: HeaderProps) {
  return (
    <div className='px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50'>
      <div className='flex items-center gap-3'>
        <h2 className='text-xl font-semibold text-gray-900'>{title}</h2>
      </div>
      <button
        onClick={handleClose}
        className='p-2 hover:bg-gray-200 rounded-lg transition hover:cursor-pointer'
      >
        <X className='w-5 h-5 text-gray-500' />
      </button>
    </div>
  );
}
