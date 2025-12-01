import type { ReactNode } from 'react';
import Modal from '../Modal';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  icon?: ReactNode;
  warningMessage?: string;
  details?: ReactNode;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  icon,
  warningMessage,
  details,
}: ConfirmModalProps) {
  const variantConfig = {
    danger: {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      confirmButton: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      confirmButton: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      confirmButton: 'bg-blue-600 hover:bg-blue-700',
    },
    success: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      confirmButton: 'bg-green-600 hover:bg-green-700',
    },
  };

  const config = variantConfig[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='md'
      showCloseButton={false}
      closeOnOverlayClick={false}
    >
      <div className='flex items-center gap-3 mb-4'>
        {icon && (
          <div className={`${config.iconBg} p-3 rounded-full`}>
            <div className={config.iconColor}>{icon}</div>
          </div>
        )}
        <h2 className='text-xl font-bold text-gray-800'>{title}</h2>
      </div>

      <p className='text-gray-600 mb-2'>{message}</p>

      {details && (
        <div className='bg-gray-50 rounded-lg p-3 mb-2'>{details}</div>
      )}

      {warningMessage && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6'>
          <p className='text-sm text-yellow-800'>{warningMessage}</p>
        </div>
      )}

      <div className='flex gap-3 mt-6'>
        <button
          onClick={onClose}
          className='flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 hover:cursor-pointer hover:disabled:cursor-not-allowed font-medium transition'
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`flex-1 text-white px-4 py-3 rounded-lg font-medium transition ${config.confirmButton} hover:cursor-pointer hover:disabled:cursor-not-allowed`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
