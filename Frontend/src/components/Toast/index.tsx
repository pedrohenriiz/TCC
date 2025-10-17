import { useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import {
  type Toast as ToastType,
  useToastStore,
} from '../../store/useToastStore';

interface ToastProps {
  toast: ToastType;
}

export function Toast({ toast }: ToastProps) {
  const { removeToast } = useToastStore();
  const [isExiting, setIsExiting] = useState(false);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-800',
      iconColor: 'text-green-500',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-800',
      iconColor: 'text-red-500',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500',
    },
  };

  const config = typeConfig[toast.type];
  const Icon = config.icon;

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300);
  };

  return (
    <div
      className={`
        flex items-center gap-3 min-w-[300px] max-w-md p-4 rounded-lg shadow-lg border-l-4
        ${config.bgColor} ${config.borderColor}
        transition-all duration-300 ease-out
        ${
          isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
        }
      `}
    >
      <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0`} />
      <p className={`flex-1 text-sm font-medium ${config.textColor}`}>
        {toast.message}
      </p>
      <button
        onClick={handleClose}
        className={`${config.iconColor} hover:opacity-70 transition flex-shrink-0`}
      >
        <X className='w-4 h-4' />
      </button>
    </div>
  );
}
