import type { ToastHu19 } from '../types';
import { CheckCircleIcon } from './AlertIcons';

// Notificacion superior para confirmar cambios de estado exitosos.
export function SuccessToast({ toast }: { toast: ToastHu19 | null }) {
  if (!toast) return null;

  return (
    <div className="fixed right-5 top-5 z-50 flex w-80 items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
      <CheckCircleIcon className="mt-0.5 h-5 w-5 text-green-600" />
      <div>
        <p className="text-sm font-bold text-gray-900">{toast.title}</p>
        <p className="mt-0.5 text-xs text-gray-500">{toast.message}</p>
      </div>
    </div>
  );
}
