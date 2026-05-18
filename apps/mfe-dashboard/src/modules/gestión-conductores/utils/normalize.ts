import type { DashboardConductoresApi } from '@nanutech/api-client';
import type { ConductorDashboard, PanelConductores } from '../types';
import {
  normalizeEstadoContrato,
  normalizeEstadoOperacional,
  toNumber,
  toStringValue,
} from './format';
import { buildPanelConductores } from './panel';

const read = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }

  return undefined;
};

const normalizeConductor = (
  raw: Record<string, unknown>,
  index: number,
): ConductorDashboard => {
  const estadoContrato = normalizeEstadoContrato(
    read(raw, ['estadoContrato', 'estado_contrato', 'estado', 'contrato_estado']),
    read(raw, ['activo', 'is_active']),
  );
  const estadoOperacional = normalizeEstadoOperacional(
    read(raw, ['estadoOperacional', 'estado_operacional', 'disponibilidad', 'estado_jornada']),
  );
  const camion = read(raw, [
    'camionAsignado',
    'camion_asignado',
    'placa',
    'placa_camion',
    'unidad_asignada',
  ]);

  return {
    id: toStringValue(read(raw, ['id', 'conductor_id', 'uuid']), `conductor-${index + 1}`),
    nombre: toStringValue(read(raw, ['nombre', 'nombre_completo', 'name']), 'Sin nombre'),
    email: toStringValue(read(raw, ['email', 'correo']), 'sin-correo@nanutech.com'),
    dni: toStringValue(read(raw, ['dni', 'documento', 'numero_documento']), '-'),
    licencia: toStringValue(read(raw, ['licencia', 'numero_licencia']), '-'),
    contacto: toStringValue(read(raw, ['contacto', 'telefono', 'celular']), '-'),
    estadoContrato,
    estadoOperacional,
    camionAsignado: typeof camion === 'string' && camion.trim() ? camion.trim() : null,
    activo: estadoContrato === 'ACTIVO',
  };
};

const overrideResumen = (
  panel: PanelConductores,
  resumen?: Record<string, unknown>,
): PanelConductores => {
  if (!resumen) return panel;

  return {
    ...panel,
    resumen: {
      totalConductores: toNumber(
        read(resumen, ['totalConductores', 'total_conductores', 'total']),
        panel.resumen.totalConductores,
      ),
      conductoresActivos: toNumber(
        read(resumen, ['conductoresActivos', 'conductores_activos', 'activos']),
        panel.resumen.conductoresActivos,
      ),
      disponibles: toNumber(
        read(resumen, ['disponibles', 'conductores_disponibles']),
        panel.resumen.disponibles,
      ),
      enRuta: toNumber(
        read(resumen, ['enRuta', 'en_ruta', 'personal_en_ruta']),
        panel.resumen.enRuta,
      ),
    },
  };
};

export const normalizePanelConductores = (
  payload: DashboardConductoresApi,
): PanelConductores => {
  const listado = payload.conductores ?? payload.listado ?? [];
  const conductores = listado.map((item, index) =>
    normalizeConductor(item, index),
  );

  return overrideResumen(buildPanelConductores(conductores), payload.resumen);
};
