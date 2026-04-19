import React from 'react';

interface NotificacionExitosaProps {
  visible: boolean;
  mensaje: string;
  tipo?: 'exito' | 'error' | 'info';
}

/**
 * Componente de notificación para mostrar mensajes de éxito/error
 * Se auto-oculta después de 3 segundos
 */
export const NotificacionExitosa: React.FC<NotificacionExitosaProps> = ({
  visible,
  mensaje,
  tipo = 'exito',
}) => {
  if (!visible) {
    return null;
  }

  const obtenerIcono = () => {
    switch (tipo) {
      case 'exito':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
      default:
        return '✓';
    }
  };

  const estiloByTipo: Record<'exito' | 'error' | 'info', string> = {
    exito: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    error: 'border-rose-200 bg-rose-50 text-rose-700',
    info: 'border-sky-200 bg-sky-50 text-sky-700',
  };

  return (
    <div className={`fixed right-5 top-5 z-50 flex max-w-md items-center gap-2 rounded-lg border px-3 py-2 text-sm shadow-lg ${estiloByTipo[tipo]}`}>
      <span className="font-bold">{obtenerIcono()}</span>
      <span>{mensaje}</span>
    </div>
  );
};
