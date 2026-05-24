import type { DashboardConductoresApi } from '@nanutech/api-client';
import type { ConductorDashboard, PanelConductores, SegmentoGrafica } from '../types';
import {
  normalizeEstadoContrato,
  normalizeEstadoOperacional,
  toNumber,
  toStringValue,
} from './format';
import { buildPanelConductores } from './panel';

// Lee el primer campo existente dentro de una lista de posibles nombres.
const read = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }

  return undefined;
};

// Convierte una fila del backend al modelo que necesita la tabla HU10.
const normalizeConductor = (
  raw: Record<string, unknown>,
  index: number,
): ConductorDashboard => {
  // Normaliza estado contractual aunque venga como estadoContrato, estado_contrato o estado.
  const estadoContrato = normalizeEstadoContrato(
    read(raw, ['estadoContrato', 'estado_contrato', 'estado', 'contrato_estado']),
    read(raw, ['activo', 'is_active']),
  );
  // Normaliza disponibilidad aunque venga en camelCase, snake_case o como estado_jornada.
  const estadoOperacional = normalizeEstadoOperacional(
    read(raw, ['estadoOperacional', 'estado_operacional', 'disponibilidad', 'estado_jornada']),
  );
  // Obtiene placa/camion asignado desde cualquiera de los nombres usados por backend.
  const camion = read(raw, [
    'camionAsignado',
    'camion_asignado',
    'placa',
    'placa_camion',
    'unidad_asignada',
  ]);
  // Convierte strings vacios o valores inexistentes a null.
  const camionAsignado = typeof camion === 'string' && camion.trim()
    ? camion.trim()
    : null;

  // Retorna una fila completa con defaults seguros para campos que backend no envia.
  return {
    id: toStringValue(read(raw, ['id', 'conductor_id', 'uuid']), `conductor-${index + 1}`),
    nombre: toStringValue(read(raw, ['nombre', 'nombre_completo', 'name']), 'Sin nombre'),
    email: toStringValue(read(raw, ['email', 'correo']), ''),
    dni: toStringValue(read(raw, ['dni', 'documento', 'numero_documento']), '-'),
    licencia: toStringValue(read(raw, ['licencia', 'numero_licencia']), '-'),
    contacto: toStringValue(read(raw, ['contacto', 'telefono', 'celular']), '-'),
    estadoContrato,
    estadoOperacional,
    // Backend manda "Sin asignar"; la UI lo trata como ausencia de placa real.
    camionAsignado: camionAsignado?.toLowerCase() === 'sin asignar' ? null : camionAsignado,
    activo: estadoContrato === 'ACTIVO',
  };
};

// Sobrescribe los KPIs calculados localmente con los indicadores oficiales del backend.
const overrideResumen = (
  panel: PanelConductores,
  resumen?: Record<string, unknown>,
): PanelConductores => {
  // Si el backend no mando resumen, se conservan los valores calculados por lista.
  if (!resumen) return panel;

  return {
    ...panel,
    resumen: {
      // Total de conductores registrados.
      totalConductores: toNumber(
        read(resumen, ['totalConductores', 'total_conductores', 'total']),
        panel.resumen.totalConductores,
      ),
      // Conductores con contrato vigente/activo.
      conductoresActivos: toNumber(
        read(resumen, ['conductoresActivos', 'conductores_activos', 'activos']),
        panel.resumen.conductoresActivos,
      ),
      // Conductores disponibles para asignacion.
      disponibles: toNumber(
        read(resumen, ['disponibles', 'conductores_disponibles']),
        panel.resumen.disponibles,
      ),
      // Personal actualmente en ruta.
      enRuta: toNumber(
        read(resumen, ['enRuta', 'en_ruta', 'personal_en_ruta']),
        panel.resumen.enRuta,
      ),
    },
  };
};

// Asigna color de grafica a cada segmento segun su key normalizada.
const chartColor = (key: string) => {
  // INACTIVO debe evaluarse antes de ACTIVO porque contiene esa palabra.
  if (key.includes('INACTIVO')) return '#ef4444';
  if (key.includes('ACTIVO')) return '#10b981';
  if (key.includes('SUSPEND')) return '#f97316';
  if (key.includes('RUTA')) return '#3b82f6';
  if (key.includes('DESCANS')) return '#f97316';
  if (key.includes('PERMISO')) return '#94a3b8';
  return '#22c55e';
};

// Convierte keys como EN_RUTA en etiquetas legibles como En Ruta.
const chartLabel = (key: string) =>
  key
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

// Alinea estados crudos del backend con los estados visuales de la HU10.
const normalizeChartKey = (value: unknown) => {
  const key = toStringValue(value, 'SIN_DATO').toUpperCase();
  if (key === 'DESCANSO') return 'DESCANSANDO';
  return key;
};

// Normaliza arrays de grafica del backend: { estado, cantidad } -> SegmentoGrafica.
const normalizeChartList = (
  value: unknown,
  fallback: SegmentoGrafica[],
): SegmentoGrafica[] => {
  // Si backend no manda una lista valida, se mantiene la grafica calculada localmente.
  if (!Array.isArray(value)) return fallback;

  return value.map((item) => {
    // Cada item del backend puede usar estado/key y cantidad/value/total.
    const raw = item as Record<string, unknown>;
    const key = normalizeChartKey(read(raw, ['estado', 'key']));

    // Devuelve la forma que espera Recharts.
    return {
      key,
      label: chartLabel(key),
      value: toNumber(read(raw, ['cantidad', 'value', 'total']), 0),
      color: chartColor(key),
    };
  });
};

// Sobrescribe graficas calculadas con graficas oficiales de /resumen.
const overrideGraficas = (
  panel: PanelConductores,
  graficas?: Record<string, unknown>,
): PanelConductores => {
  // Si no hay graficas del backend, se conservan las generadas desde la lista.
  if (!graficas) return panel;

  return {
    ...panel,
    graficas: {
      // Backend manda distribucionContrato para el pie chart.
      contrato: normalizeChartList(
        read(graficas, ['distribucionContrato', 'distribucion_contrato', 'contrato']),
        panel.graficas.contrato,
      ),
      // Backend manda estadoOperacional para el bar chart.
      operacional: normalizeChartList(
        read(graficas, ['estadoOperacional', 'estado_operacional', 'operacional']),
        panel.graficas.operacional,
      ),
    },
  };
};

// Normaliza la respuesta agregada del api-client para que la UI use un solo modelo.
export const normalizePanelConductores = (
  payload: DashboardConductoresApi,
): PanelConductores => {
  // El listado puede venir como conductores o listado segun version del contrato.
  const listado = payload.conductores ?? payload.listado ?? [];
  // Convierte cada fila cruda en ConductorDashboard.
  const conductores = listado.map((item, index) =>
    normalizeConductor(item, index),
  );
  // Resumen puede venir como indicadores cuando se consume /resumen.
  const resumen = payload.indicadores ?? payload.resumen;
  // Graficas puede venir como graficos cuando se consume /resumen.
  const graficas = payload.graficos ?? payload.graficas;

  // Base local + overrides oficiales del backend.
  return overrideGraficas(overrideResumen(buildPanelConductores(conductores), resumen), graficas);
};
