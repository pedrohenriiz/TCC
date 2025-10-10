import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className='bg-white shadow px-6 py-4 flex justify-between items-center relative'>
      {/* Menu Dropdown */}
      <div className='relative' ref={menuRef}>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className='flex items-center gap-1 bg-gray-100 hover:bg-gray-200 transition rounded-full px-3 py-2 text-gray-700'
        >
          <User size={20} />
          <ChevronDown size={16} />
        </button>

        {open && (
          <div className='absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10'>
            <button
              onClick={() => navigate('/settings')}
              className='flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100'
            >
              <Settings size={16} className='mr-2' />
              Configurações
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
