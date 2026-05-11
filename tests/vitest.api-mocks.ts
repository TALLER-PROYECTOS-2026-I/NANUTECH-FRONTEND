import MockAdapter from 'axios-mock-adapter';
import apiClient from '@nanutech/api-client';

// Global axios mock for tests
const mock = new MockAdapter(apiClient);

// Lightweight default responses used across tests to avoid real network calls
mock.onGet('/dashboard').reply(200, {
  success: true,
  data: {
    kpis: { totalCamiones: 0, contratosActivos: 0, alertasActivas: 0, ingresos: 0 },
    alertas: { alertasActivas: [], contratosPorExpirar: [] },
    graficas: {},
    topCamiones: [],
    contratos: [],
  },
});

mock.onGet('/dashboard/gerencial').reply(200, {
  success: true,
  data: {
    ultimo_actualizacion: new Date().toISOString(),
    estado_sistema: 'OK',
    resumen_general: {
      jornadas: 0,
      jornadas_completadas: 0,
      horas_acumuladas: '0',
      km_totales: 0,
      eficiencia: '0%',
      flota_activa: 0,
      conductores_activos: 0,
      contratos_activos: 0,
      ingresos_estimados: 0,
    },
    graficas: { jornadas_por_dia: [], sectores_jornadas: [], sectores_camiones: [], sectores_conductores: [] },
    operaciones: { en_progreso: [], camiones_mantenimiento: [], conductores_disponibles: [] },
    rendimiento: { top_conductores_km: [], top_camiones_uso: [] },
    historial: [],
  },
});

mock.onGet('/unidades/disponibles').reply(200, {
  success: true,
  data: [],
});

// Fallback: respond with an empty success object for any other request so tests don't hit network
mock.onAny().reply(200, { success: true, data: {} });

export default mock;
