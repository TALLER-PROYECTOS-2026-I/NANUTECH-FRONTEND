import React from 'react';

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
  const obtenerBadgeClasses = () => {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-blue-600 text-white';
      case 'EN_PROGRESO':
        return 'bg-emerald-600 text-white';
      case 'FINALIZADO':
        return 'bg-violet-600 text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const obtenerContenedorClasses = () => {
    if (estado === 'EN_PROGRESO') {
      return 'border-emerald-300 bg-emerald-50/40';
    }
    if (estado === 'PENDIENTE') {
      return 'border-blue-200 bg-blue-50/40';
    }
    return 'border-gray-200 bg-white';
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
    <div className={`mb-6 rounded-xl border p-4 shadow-sm md:p-5 ${obtenerContenedorClasses()}`}>
      <div className="mb-5 flex flex-col gap-3 border-b border-gray-200 pb-4 md:flex-row md:items-center md:justify-between">
        <span className={`inline-flex w-fit items-center rounded-md px-3 py-1 text-xs font-semibold ${obtenerBadgeClasses()}`}>
          {obtenerTextoEstado()}
        </span>

        {estado === 'EN_PROGRESO' && tiempoTranscurrido && (
          <div className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-right shadow-sm">
            <p className="text-[10px] uppercase tracking-wide text-gray-500">Tiempo transcurrido</p>
            <p className="font-mono text-2xl font-bold text-emerald-600">{tiempoTranscurrido}</p>
            <p className="text-[10px] text-gray-500">Turno activo</p>
          </div>
        )}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Conductor</p>
          <p className="text-sm font-semibold text-gray-900">{nombreConductor}</p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Vehiculo</p>
          <p className="text-sm font-semibold text-gray-900">{placa || 'N/A'}</p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">ID Contrato</p>
          <p className="text-sm font-semibold text-sky-700">{idContrato}</p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Fecha jornada</p>
          <p className="text-sm font-semibold text-gray-900">{fecha}</p>
        </div>
      </div>

      <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Origen</p>
              <p className="text-sm text-gray-900">{origen}</p>
            </div>
          </div>
        </div>
        <div className="my-3 h-px w-full bg-gray-200"></div>
        <div className="flex items-start gap-2">
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500"></span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Destino</p>
            <p className="text-sm text-gray-900">{destino}</p>
          </div>
        </div>
      </div>

      {children && <div className="flex flex-col gap-3">{children}</div>}
    </div>
  );
};
