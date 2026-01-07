import { useRef } from 'react';
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
  const backdropRef = useRef<HTMLDivElement>(null);
  const mouseDownTargetRef = useRef<EventTarget | null>(null);

  // ✨ Registra onde o mousedown começou
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownTargetRef.current = e.target;
  };

  // ✨ Só fecha se mousedown E mouseup foram no backdrop
  const handleMouseUp = (e: React.MouseEvent) => {
    if (
      e.target === backdropRef.current &&
      mouseDownTargetRef.current === backdropRef.current
    ) {
      onClose();
    }
    // Limpa a referência
    mouseDownTargetRef.current = null;
  };

  return (
    <div
      ref={backdropRef}
      className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4'
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div
        className='bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col'
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
