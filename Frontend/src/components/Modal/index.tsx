import React from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: ReactNode;
  iconBgColor?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

function Modal({
  isOpen,
  onClose,
  title,
  icon,
  iconBgColor = 'bg-blue-100',
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className='fixed inset-0 flex items-center justify-center z-50 p-6'
      onClick={handleOverlayClick}
    >
      <div
        className='absolute inset-0 bg-black opacity-75'
        onClick={onClose}
      ></div>

      <div
        className={`relative bg-white rounded-lg shadow-2xl ${sizeClasses[size]} w-full ${className}`}
      >
        {(title || icon || showCloseButton) && (
          <div className='flex items-center justify-between p-6 border-b'>
            <div className='flex items-center gap-3'>
              {icon && (
                <div className={`${iconBgColor} p-3 rounded-full`}>{icon}</div>
              )}
              {title && (
                <h2 className='text-xl font-bold text-gray-800'>{title}</h2>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className='text-gray-400 hover:text-gray-600 transition'
              >
                <X className='w-6 h-6' />
              </button>
            )}
          </div>
        )}

        <div className='p-6'>{children}</div>

        {footer && (
          <div className='p-6 border-t bg-gray-50 rounded-b-lg'>{footer}</div>
        )}
      </div>
    </div>
  );
}

export default Modal;
