interface FooterProps {
  onClose: () => void;
  onConfirm: () => void;
  confirmText: string;
}

export default function Footer({
  onClose,
  onConfirm,
  confirmText,
}: FooterProps) {
  return (
    <div className='flex gap-3'>
      <button
        onClick={onClose}
        className='flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 font-medium transition hover:cursor-pointer'
      >
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        className='flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 font-medium transition hover:cursor-pointer'
      >
        {confirmText}
      </button>
    </div>
  );
}
