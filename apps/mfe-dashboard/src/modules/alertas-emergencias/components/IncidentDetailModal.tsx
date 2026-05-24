import type { Incidente } from '../types';
import { buildMapsUrl, formatCoord, formatFechaHora } from '../utils/format';
import { AlertTriangleIcon, MapPinIcon, PhoneIcon, WrenchIcon } from './AlertIcons';
import { StatusBadge } from './StatusBadge';

type IncidentDetailModalProps = {
  incidente: Incidente | null;
  resolving: boolean;
  updating: boolean;
  onClose: () => void;
  onResolve: (incidente: Incidente) => void;
  onMarkInProgress: (incidente: Incidente) => void;
};

// Modal centralizado para revisar y accionar panicos o auxilios mecanicos.
export function IncidentDetailModal({
  incidente,
  resolving,
  updating,
  onClose,
  onResolve,
  onMarkInProgress,
}: IncidentDetailModalProps) {
  if (!incidente) return null;

  const isPanico = incidente.tipo === 'PANICO';
  const isAuxilio = incidente.tipo === 'AUXILIO_MECANICO';
  const isResolved = incidente.estado === 'RESUELTA';
  const mapsUrl = buildMapsUrl(incidente.latitud, incidente.longitud);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 px-4">
      <article className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl">
        <header className="mb-4 flex items-start justify-between">
          <div>
            <div className={`flex items-center gap-2 text-sm font-bold ${isPanico ? 'text-red-600' : 'text-orange-600'}`}>
              {isPanico ? <AlertTriangleIcon /> : <WrenchIcon />}
              <span>{isPanico ? 'Detalle de Alerta de Panico' : 'Detalle de Auxilio Mecanico'}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {isPanico ? 'Informacion completa de la emergencia reportada' : 'Informacion de la falla mecanica reportada'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-lg leading-none text-gray-500 hover:text-gray-800">
            ×
          </button>
        </header>

        {isPanico && incidente.estado === 'ACTIVA' && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
            <AlertTriangleIcon className="h-3.5 w-3.5" />
            EMERGENCIA ACTIVA - Requiere atencion inmediata
          </div>
        )}

        {isAuxilio && incidente.estado === 'ACTIVA' && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-orange-300 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">
            <WrenchIcon className="h-3.5 w-3.5" />
            Solicitud pendiente - Requiere asignacion de tecnico
          </div>
        )}

        <section className="mb-4 rounded-lg border border-gray-200 p-4">
          <h4 className="mb-4 text-xs font-bold text-gray-900">
            {isPanico ? 'Informacion del Conductor' : 'Detalles de la Falla'}
          </h4>
          <dl className="space-y-3 text-xs">
            {isAuxilio && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Tipo de Falla:</dt>
                <dd className="font-bold text-orange-700">{incidente.tipoFallaMecanica ?? incidente.detalle}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Nombre:</dt>
              <dd className="font-bold text-gray-900">{incidente.conductor.nombre}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">ID Conductor:</dt>
              <dd className="font-bold text-gray-900">{incidente.conductor.id}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Fecha y Hora:</dt>
              <dd className="font-bold text-gray-900">{formatFechaHora(incidente.fechaHora)}</dd>
            </div>
            {isAuxilio && (
              <>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Unidad:</dt>
                  <dd className="font-bold text-gray-900">{incidente.unidad?.placa ?? 'Sin asignar'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Estado:</dt>
                  <dd>
                    <StatusBadge estado={incidente.estado} />
                  </dd>
                </div>
              </>
            )}
          </dl>
        </section>

        {isPanico && (
          <section className="mb-4 rounded-lg border border-gray-200 p-4">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold text-gray-900">
              <MapPinIcon className="h-3.5 w-3.5 text-red-500" />
              Ubicacion GPS
            </div>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Latitud:</dt>
                <dd className="font-bold text-gray-900">{formatCoord(incidente.latitud)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Longitud:</dt>
                <dd className="font-bold text-gray-900">{formatCoord(incidente.longitud)}</dd>
              </div>
            </dl>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <MapPinIcon className="h-3.5 w-3.5" />
              Ver en Google Maps
            </a>
          </section>
        )}

        <div className="space-y-2">
          {isAuxilio && incidente.estado === 'ACTIVA' && (
            <button
              type="button"
              disabled={updating}
              onClick={() => onMarkInProgress(incidente)}
              className="flex w-full items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {updating ? 'Actualizando...' : 'Marcar como En Proceso'}
            </button>
          )}

          {!isResolved && (
            <button
              type="button"
              disabled={resolving}
              onClick={() => onResolve(incidente)}
              className="flex w-full items-center justify-center rounded-md bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {resolving ? 'Resolviendo...' : 'Marcar como Resuelto'}
            </button>
          )}

          <a
            href={`tel:${incidente.conductor.telefono}`}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            <PhoneIcon />
            {isPanico ? 'Llamar al Conductor' : 'Contactar al Conductor'}
          </a>
        </div>

        <footer className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>
        </footer>
      </article>
    </div>
  );
}
