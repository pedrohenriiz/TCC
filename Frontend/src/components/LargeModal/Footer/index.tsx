import { Save } from 'lucide-react';
import ConfirmButton from '../../ConfirmButton';

interface FooterProps {
  handleClose: () => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}

export default function Footer({
  handleClose,
  isSubmitting,
  handleSubmit,
  isValid,
}: FooterProps) {
  return (
    <div className='px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between'>
      <button
        type='button'
        onClick={handleClose}
        disabled={isSubmitting}
        className='px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50 hover:cursor-pointer'
      >
        Cancelar
      </button>
      <ConfirmButton
        type='submit'
        disabled={isSubmitting || !isValid}
        onClick={handleSubmit}
        Icon={<Save className='w-5 h-5' />}
        text={isSubmitting ? 'Salvando...' : 'Salvar'}
        iconPosition='left'
      />
    </div>
  );
}
