import React from 'react';
import '../styles/NotificacionExitosa.css';

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

  return (
    <div className={`notificacion notificacion--${tipo}`}>
      <span className="notificacion__icono">{obtenerIcono()}</span>
      <span className="notificacion__mensaje">{mensaje}</span>
    </div>
  );
};
