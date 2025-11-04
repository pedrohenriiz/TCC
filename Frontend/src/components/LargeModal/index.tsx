import Footer from './Footer';
import Header from './Header';

interface LargeModalProps {
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isValid: boolean;
  children: React.ReactNode;
}

export default function LargeModal({
  title,
  onClose,
  onSubmit,
  isSubmitting,
  isValid,
  children,
}: LargeModalProps) {
  return (
    <div
      className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'
      onClick={onClose}
    >
      <div
        className='bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col'
        onClick={(e) => e.stopPropagation()}
      >
        <Header title={title} handleClose={onClose} />

        {children}

        <Footer
          handleClose={onClose}
          handleSubmit={onSubmit}
          isSubmitting={isSubmitting}
          isValid={isValid}
        />
      </div>
    </div>
  );
}
