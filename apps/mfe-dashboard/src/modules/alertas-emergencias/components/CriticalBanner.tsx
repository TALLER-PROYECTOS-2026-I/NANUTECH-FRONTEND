import { AlertTriangleIcon } from './AlertIcons';

// Banner reservado exclusivamente para alertas de panico activas.
export function CriticalBanner({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <div className="mb-5 flex items-center gap-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
      <AlertTriangleIcon className="h-4 w-4" />
      <span>{count} alerta(s) activa(s) requieren atencion inmediata.</span>
    </div>
  );
}
