import { useEffect, useMemo, useState } from 'react';
import { getDashboardGerencial, type DashboardGerencialPayload } from '@nanutech/api-client';
import {
  DashboardHeader,
  DashboardSkeletonState,
  DashboardTabs,
  DashboardToolbar,
  EmptyDashboardState,
  ErrorDashboardState,
  HistorialTab,
  OperacionesTab,
  RendimientoTab,
  ResumenGeneralTab,
  type DashboardTab,
  type TiempoFiltro,
} from '../components/DashboardGerencialComponents';

const EMPTY_DASHBOARD: DashboardGerencialPayload = {
  ultimo_actualizacion: '',
  estado_sistema: 'Sin datos',
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
  graficas: {
    jornadas_por_dia: [],
    sectores_jornadas: [],
    sectores_camiones: [],
    sectores_conductores: [],
  },
  operaciones: {
    en_progreso: [],
    camiones_mantenimiento: [],
    conductores_disponibles: [],
  },
  rendimiento: {
    top_conductores_km: [],
    top_camiones_uso: [],
  },
  historial: [],
};

function normalizeDashboard(payload: DashboardGerencialPayload): DashboardGerencialPayload {
  return {
    ...EMPTY_DASHBOARD,
    ...payload,
    resumen_general: {
      ...EMPTY_DASHBOARD.resumen_general,
      ...payload.resumen_general,
    },
    graficas: {
      ...EMPTY_DASHBOARD.graficas,
      ...payload.graficas,
      jornadas_por_dia: payload.graficas?.jornadas_por_dia ?? [],
      sectores_jornadas: payload.graficas?.sectores_jornadas ?? [],
      sectores_camiones: payload.graficas?.sectores_camiones ?? [],
      sectores_conductores: payload.graficas?.sectores_conductores ?? [],
    },
    operaciones: {
      ...EMPTY_DASHBOARD.operaciones,
      ...payload.operaciones,
      en_progreso: payload.operaciones?.en_progreso ?? [],
      camiones_mantenimiento: payload.operaciones?.camiones_mantenimiento ?? [],
      conductores_disponibles: payload.operaciones?.conductores_disponibles ?? [],
    },
    rendimiento: {
      ...EMPTY_DASHBOARD.rendimiento,
      ...payload.rendimiento,
      top_conductores_km: payload.rendimiento?.top_conductores_km ?? [],
      top_camiones_uso: payload.rendimiento?.top_camiones_uso ?? [],
    },
    historial: payload.historial ?? [],
  };
}

function DashboardGerencial() {
  const [data, setData] = useState<DashboardGerencialPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('resumen');
  const [query, setQuery] = useState('');
  const [filtro, setFiltro] = useState<TiempoFiltro>('todas');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    let cancelled = false;
    const search = query.trim();

    setLoading(true);
    setError(null);

    getDashboardGerencial({ tiempo: filtro, ...(search ? { search } : {}) })
      .then((res) => {
        if (cancelled) return;
        setData(normalizeDashboard(res));
      })
      .catch(() => {
        if (cancelled) return;
        setData(null);
        setError('No se pudo cargar el dashboard gerencial desde el servidor.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filtro, query]);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Intl.DateTimeFormat('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
          .format(new Date())
          .replace(/\s/g, ' ')
      );
    };

    updateTime();
    const timer = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredOperaciones = useMemo(() => {
    if (!data) return null;
    const term = query.trim().toLowerCase();
    if (!term) return data.operaciones;

    return {
      ...data.operaciones,
      en_progreso: data.operaciones.en_progreso.filter(
        (item) =>
          item.id.toLowerCase().includes(term) ||
          item.conductor.toLowerCase().includes(term) ||
          item.camion.toLowerCase().includes(term)
      ),
    };
  }, [data, query]);

  const filteredHistorial = useMemo(() => {
    if (!data) return [];
    const term = query.trim().toLowerCase();
    if (!term) return data.historial;

    return data.historial.filter(
      (item) =>
        item.id.toLowerCase().includes(term) ||
        item.conductor.toLowerCase().includes(term) ||
        item.camion.toLowerCase().includes(term)
    );
  }, [data, query]);

  if (loading && !data) return <DashboardSkeletonState />;

  if (error && !data) {
    return (
      <ErrorDashboardState
        message={error}
        onRetry={() => {
          setFiltro((current) => current);
          setLoading(true);
          const search = query.trim();
          getDashboardGerencial({ tiempo: filtro, ...(search ? { search } : {}) })
            .then((res) => {
              setData(normalizeDashboard(res));
              setError(null);
            })
            .catch(() => setError('No se pudo cargar el dashboard gerencial desde el servidor.'))
            .finally(() => setLoading(false));
        }}
      />
    );
  }

  if (!data) return <EmptyDashboardState />;

  const { resumen_general, graficas, operaciones, rendimiento, historial, estado_sistema, ultimo_actualizacion } =
    data;

  return (
    <div className="space-y-6 pb-8">
      <DashboardHeader
        estadoSistema={estado_sistema}
        ultimaActualizacion={ultimo_actualizacion}
        currentTime={currentTime}
      />

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          {error}
        </div>
      )}

      <DashboardToolbar query={query} onQueryChange={setQuery} filtro={filtro} onFiltroChange={setFiltro} />
      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {loading && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          Actualizando datos del dashboard...
        </div>
      )}

      {activeTab === 'resumen' && <ResumenGeneralTab resumen={resumen_general} graficas={graficas} />}

      {activeTab === 'operaciones' && filteredOperaciones && (
        <OperacionesTab
          enProgreso={filteredOperaciones.en_progreso}
          camionesMantenimiento={operaciones.camiones_mantenimiento}
          conductoresDisponibles={operaciones.conductores_disponibles}
        />
      )}

      {activeTab === 'rendimiento' && <RendimientoTab data={rendimiento} />}

      {activeTab === 'historial' && <HistorialTab historial={filteredHistorial} />}

      {historial.length === 0 &&
        operaciones.en_progreso.length === 0 &&
        resumen_general.jornadas === 0 &&
        activeTab === 'resumen' && <EmptyDashboardState compact />}
    </div>
  );
}

export default DashboardGerencial;
