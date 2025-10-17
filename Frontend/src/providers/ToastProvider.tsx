import { Toast } from '../components/Toast';
import { useToastStore } from '../store/useToastStore';

export default function ToastProvider() {
  const { toasts } = useToastStore();

  return (
    <div className='fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none'>
      {toasts.map((toast) => (
        <div key={toast.id} className='pointer-events-auto'>
          <Toast toast={toast} />
        </div>
      ))}
    </div>
  );
}
