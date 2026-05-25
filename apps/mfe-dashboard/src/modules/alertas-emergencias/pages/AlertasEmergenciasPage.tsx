import { useEffect, useMemo, useState } from 'react';
import {
  actualizarEstadoAuxilio,
  getAlertasActivas,
  getIndicadoresAlertas,
  resolverAlerta,
} from '@nanutech/api-client';
import type { AlertaApi } from '@nanutech/api-client';
import { MonitoreoSidebar } from '../../monitoreo-camiones/components/MonitoreoSidebar';
import { AuxiliosTable } from '../components/AuxiliosTable';
import { CheckCircleIcon, AlertTriangleIcon, WrenchIcon } from '../components/AlertIcons';
import { CriticalBanner } from '../components/CriticalBanner';
import { IncidentDetailModal } from '../components/IncidentDetailModal';
import { PanicAlertsTable } from '../components/PanicAlertsTable';
import { SuccessToast } from '../components/SuccessToast';
import { SummaryCard } from '../components/SummaryCard';
import type { Incidente, IndicadoresHu19, ToastHu19 } from '../types';
import { formatFechaActual, formatHoraActual } from '../utils/format';
import { normalizeIncidente, normalizeIndicadores } from '../utils/normalize';
import { replaceIncidente, sortIncidentes } from '../utils/panel';

// Estado inicial vacio para no mostrar informacion ficticia si el backend aun no responde.
const EMPTY_INDICADORES: IndicadoresHu19 = {
  panicoActivas: 0,
  auxilioPendientes: 0,
  totalResueltas: 0,
  tienePanicoActivo: false,
};

// Actualiza los contadores locales cuando un incidente cambia de estado.
function updateIndicadoresAfterChange(
  current: IndicadoresHu19,
  before: Incidente,
  after: Incidente,
): IndicadoresHu19 {
  let panicoActivas = current.panicoActivas;
  let auxilioPendientes = current.auxilioPendientes;
  let totalResueltas = current.totalResueltas;

  if (before.tipo === 'PANICO' && before.estado === 'ACTIVA') panicoActivas -= 1;
  if (after.tipo === 'PANICO' && after.estado === 'ACTIVA') panicoActivas += 1;

  if (before.tipo === 'AUXILIO_MECANICO' && before.estado !== 'RESUELTA') auxilioPendientes -= 1;
  if (after.tipo === 'AUXILIO_MECANICO' && after.estado !== 'RESUELTA') auxilioPendientes += 1;

  if (before.estado !== 'RESUELTA' && after.estado === 'RESUELTA') totalResueltas += 1;

  return {
    panicoActivas: Math.max(0, panicoActivas),
    auxilioPendientes: Math.max(0, auxilioPendientes),
    totalResueltas: Math.max(0, totalResueltas),
    tienePanicoActivo: panicoActivas > 0,
  };
}

function AlertasEmergenciasPage() {
  const [incidentes, setIncidentes] = useState<Incidente[]>([]);
  const [indicadores, setIndicadores] = useState<IndicadoresHu19>(EMPTY_INDICADORES);
  const [selected, setSelected] = useState<Incidente | null>(null);
  const [toast, setToast] = useState<ToastHu19 | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [fechaActual, setFechaActual] = useState('');
  const [horaActual, setHoraActual] = useState('');

  // Mantiene visible la fecha y hora de ultima actualizacion.
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setFechaActual(formatFechaActual(now));
      setHoraActual(formatHoraActual(now));
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  // Carga indicadores y alertas activas desde backend sin usar datos ficticios.
  useEffect(() => {
    let mounted = true;

    const loadPanel = async () => {
      try {
        const [indicadoresData, alertasData] = await Promise.all([
          getIndicadoresAlertas(),
          getAlertasActivas(),
        ]);

        if (!mounted) return;

        setIndicadores(normalizeIndicadores(indicadoresData));
        setIncidentes(sortIncidentes(alertasData.map((alerta: AlertaApi) => normalizeIncidente(alerta))));
      } catch (error) {
        if (!mounted) return;

        console.error('Error cargando alertas y emergencias:', error);
        setIndicadores(EMPTY_INDICADORES);
        setIncidentes([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPanel();
    const interval = window.setInterval(loadPanel, 30000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  // Separa alertas de panico para su tabla.
  const alertasPanico = useMemo(
    () => incidentes.filter((incidente) => incidente.tipo === 'PANICO'),
    [incidentes],
  );

  // Separa auxilios mecanicos para su tabla.
  const auxiliosMecanicos = useMemo(
    () => incidentes.filter((incidente) => incidente.tipo === 'AUXILIO_MECANICO'),
    [incidentes],
  );

  // Muestra un toast temporal despues de una accion exitosa.
  const showToast = (nextToast: ToastHu19) => {
    setToast(nextToast);
    window.setTimeout(() => setToast(null), 4200);
  };

  // Inserta la version actualizada del incidente y recalcula contadores afectados.
  const applyIncidentUpdate = (before: Incidente, after: Incidente) => {
    setIncidentes((current) => replaceIncidente(current, after));
    setIndicadores((current) => updateIndicadoresAfterChange(current, before, after));
    setSelected(after);
  };

  // Resuelve cualquier tipo de incidente desde el modal.
  const handleResolve = async (incidente: Incidente) => {
    setResolving(true);

    try {
      const updated = normalizeIncidente(
        await resolverAlerta(incidente.id, {
          detalle_resolucion: 'Incidente resuelto desde el panel de alertas.',
        }),
      );
      applyIncidentUpdate(incidente, updated);
      showToast({
        title: incidente.tipo === 'PANICO' ? 'Alerta de panico resuelta' : 'Auxilio mecanico resuelto',
        message: 'El estado del incidente fue actualizado.',
      });
    } catch (error) {
      console.error('Error resolviendo incidente:', error);
    } finally {
      setResolving(false);
    }
  };

  // Cambia un auxilio activo a en proceso cuando se asigna soporte.
  const handleMarkInProgress = async (incidente: Incidente) => {
    setUpdating(true);

    try {
      const updated = normalizeIncidente(
        await actualizarEstadoAuxilio(incidente.id, { estado: 'EN_PROCESO' }),
      );
      applyIncidentUpdate(incidente, updated);
      showToast({
        title: 'Auxilio en proceso',
        message: 'El estado del auxilio fue actualizado.',
      });
    } catch (error) {
      console.error('Error actualizando auxilio mecanico:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <MonitoreoSidebar />
      <SuccessToast toast={toast} />

      <div className="ml-52 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-8 py-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Alertas y Emergencias</h1>
            <p className="text-sm text-gray-500">{fechaActual}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Ultima actualizacion</p>
            <p className="text-sm font-semibold text-gray-800">{horaActual}</p>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">
          <section className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Panel de Alertas y Emergencias</h2>
            <p className="text-sm text-gray-500">
              Monitoreo en tiempo real de alertas de panico y solicitudes de auxilio mecanico
            </p>
          </section>

          <CriticalBanner count={indicadores.panicoActivas} />

          <section className="mb-5 grid gap-4 lg:grid-cols-3">
            <SummaryCard
              title="Alertas de Panico"
              value={indicadores.panicoActivas}
              helper="Alertas activas"
              tone="red"
              icon={<AlertTriangleIcon className="h-6 w-6" />}
            />
            <SummaryCard
              title="Auxilios Mecanicos"
              value={indicadores.auxilioPendientes}
              helper="Pendientes de atencion"
              tone="orange"
              icon={<WrenchIcon className="h-6 w-6" />}
            />
            <SummaryCard
              title="Total Resueltas"
              value={indicadores.totalResueltas}
              helper="Casos cerrados"
              tone="green"
              icon={<CheckCircleIcon className="h-6 w-6" />}
            />
          </section>

          {loading ? (
            <p className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              Cargando alertas y emergencias...
            </p>
          ) : (
            <div className="space-y-5">
              <PanicAlertsTable alertas={alertasPanico} onView={setSelected} />
              <AuxiliosTable auxilios={auxiliosMecanicos} onView={setSelected} />
            </div>
          )}

          <p className="mt-4 text-center text-xs text-gray-400">
            2026 NANU TECH - Sistema de Gestion de Flota de Camiones
          </p>
        </main>
      </div>

      <IncidentDetailModal
        incidente={selected}
        resolving={resolving}
        updating={updating}
        onClose={() => setSelected(null)}
        onResolve={handleResolve}
        onMarkInProgress={handleMarkInProgress}
      />
    </div>
  );
}

export default AlertasEmergenciasPage;
