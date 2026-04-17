import React from 'react';
import '../styles/TarjetaEstado.css';

interface TarjetaEstadoProps {
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'FINALIZADO' | 'SIN_JORNADA';
  nombreConductor: string;
  placa: string;
  idContrato: string;
  fecha: string;
  origen: string;
  destino: string;
  tiempoTranscurrido?: string;
  children?: React.ReactNode;
}

/**
 * Componente reutilizable que muestra la tarjeta de estado del turno
 * Implementa el diseño visual consistente según las especificaciones
 */
export const TarjetaEstado: React.FC<TarjetaEstadoProps> = ({
  estado,
  nombreConductor,
  placa,
  idContrato,
  fecha,
  origen,
  destino,
  tiempoTranscurrido,
  children,
}) => {
  const obtenerColorBadge = () => {
    switch (estado) {
      case 'PENDIENTE':
        return 'badge-pendiente';
      case 'EN_PROGRESO':
        return 'badge-progreso';
      case 'FINALIZADO':
        return 'badge-finalizado';
      default:
        return '';
    }
  };

  const obtenerTextoEstado = () => {
    switch (estado) {
      case 'PENDIENTE':
        return 'PENDIENTE';
      case 'EN_PROGRESO':
        return 'EN PROGRESO';
      case 'FINALIZADO':
        return 'COMPLETADO';
      default:
        return '';
    }
  };

  return (
    <div className={`tarjeta-estado tarjeta-estado--${estado.toLowerCase()}`}>
      <div className="tarjeta-estado__header">
        <span className={`badge ${obtenerColorBadge()}`}>
          {obtenerTextoEstado()}
        </span>

        {estado === 'EN_PROGRESO' && tiempoTranscurrido && (
          <div className="tarjeta-estado__timer">
            <span className="timer-icon">⏱</span>
            <span className="timer-text">{tiempoTranscurrido}</span>
            <span className="timer-label">Tiempo Transcurrido</span>
          </div>
        )}
      </div>

      <div className="tarjeta-estado__info">
        <div className="info-grupo">
          <span className="info-label">CONDUCTOR</span>
          <p className="info-valor">{nombreConductor}</p>
        </div>

        <div className="info-grupo">
          <span className="info-label">PLACA</span>
          <p className="info-valor">{placa}</p>
        </div>

        <div className="info-grupo">
          <span className="info-label">ID CONTRATO</span>
          <p className="info-valor">{idContrato}</p>
        </div>

        <div className="info-grupo">
          <span className="info-label">FECHA</span>
          <p className="info-valor">{fecha}</p>
        </div>
      </div>

      <div className="tarjeta-estado__ruta">
        <div className="ruta-punto">
          <span className="punto origen"></span>
          <span className="ruta-titulo">ORIGEN</span>
          <p className="ruta-ubicacion">{origen}</p>
        </div>

        <div className="ruta-separador"></div>

        <div className="ruta-punto">
          <span className="punto destino"></span>
          <span className="ruta-titulo">DESTINO</span>
          <p className="ruta-ubicacion">{destino}</p>
        </div>
      </div>

      {children && <div className="tarjeta-estado__acciones">{children}</div>}
    </div>
  );
};
