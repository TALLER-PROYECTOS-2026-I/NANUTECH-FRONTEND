import { useState, useEffect } from 'react';
import {
  getDashboardGerencial,
  type DashboardGerencialPayload,
} from '@nanutech/api-client';

function DashboardGerencial() {
  const [data, setData] = useState<DashboardGerencialPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardGerencial({ tiempo: 'todas' })
      .then((res) => setData(res))
      .catch(() => setError('Error al obtener datos del dashboard gerencial'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-blue-700 animate-pulse">Cargando dashboard gerencial...</div>;
  if (error || !data) return <div className="p-8 text-red-500">{error}</div>;

  const { resumen_general, graficas, operaciones, rendimiento, historial, estado_sistema } = data;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Dashboard Gerencial</h2>
        <span className="text-sm text-green-600 font-medium">{estado_sistema}</span>
      </div>

      {/* Resumen general */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Jornadas" value={resumen_general.jornadas} />
        <KpiCard label="Completadas" value={resumen_general.jornadas_completadas} />
        <KpiCard label="Horas acumuladas" value={resumen_general.horas_acumuladas} />
        <KpiCard label="KM totales" value={resumen_general.km_totales} />
        <KpiCard label="Eficiencia" value={resumen_general.eficiencia} />
        <KpiCard label="Flota activa" value={resumen_general.flota_activa} />
        <KpiCard label="Conductores activos" value={resumen_general.conductores_activos} />
        <KpiCard label="Contratos activos" value={resumen_general.contratos_activos} />
        <KpiCard label="Ingresos estimados" value={`S/ ${resumen_general.ingresos_estimados.toLocaleString()}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Jornadas por día */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-slate-700 mb-3">Jornadas por día</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">KM</th>
              </tr>
            </thead>
            <tbody>
              {graficas.jornadas_por_dia.map((j) => (
                <tr key={j.fecha_jornada} className="border-b last:border-0">
                  <td className="py-1">{new Date(j.fecha_jornada).toLocaleDateString('es-PE')}</td>
                  <td className="py-1">{j.total}</td>
                  <td className="py-1">{j.km}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sectores */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-slate-700 mb-3">Estado de jornadas</h3>
          <div className="space-y-2 mb-4">
            {graficas.sectores_jornadas.map((s) => (
              <div key={s.estado} className="flex justify-between text-sm">
                <span className="text-slate-600">{s.estado}</span>
                <span className="font-semibold">{s.total}</span>
              </div>
            ))}
          </div>
          <h3 className="font-semibold text-slate-700 mb-3">Estado de camiones</h3>
          <div className="space-y-2 mb-4">
            {graficas.sectores_camiones.map((s) => (
              <div key={s.estado} className="flex justify-between text-sm">
                <span className="text-slate-600">{s.estado}</span>
                <span className="font-semibold">{s.total}</span>
              </div>
            ))}
          </div>
          <h3 className="font-semibold text-slate-700 mb-3">Estado de conductores</h3>
          <div className="space-y-2">
            {graficas.sectores_conductores.map((s) => (
              <div key={s.estado} className="flex justify-between text-sm">
                <span className="text-slate-600">{s.estado}</span>
                <span className="font-semibold">{s.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Operaciones */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-slate-700 mb-3">Operaciones en progreso</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="pb-2">Conductor</th>
                <th className="pb-2">Camión</th>
                <th className="pb-2">Inicio</th>
              </tr>
            </thead>
            <tbody>
              {operaciones.en_progreso.map((op) => (
                <tr key={op.id} className="border-b last:border-0">
                  <td className="py-1">{op.conductor}</td>
                  <td className="py-1">{op.camion}</td>
                  <td className="py-1">
                    {op.hora_inicio ? new Date(op.hora_inicio).toLocaleTimeString('es-PE') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="font-semibold text-slate-700 mt-4 mb-2">Camiones en mantenimiento</h3>
          {operaciones.camiones_mantenimiento.length === 0 ? (
            <p className="text-sm text-slate-400">Ninguno</p>
          ) : (
            operaciones.camiones_mantenimiento.map((c) => (
              <div key={c.placa} className="text-sm text-slate-600">
                {c.placa} — {c.marca} {c.modelo}
              </div>
            ))
          )}

          <h3 className="font-semibold text-slate-700 mt-4 mb-2">Conductores disponibles</h3>
          <div className="flex flex-wrap gap-2">
            {operaciones.conductores_disponibles.map((c) => (
              <span key={c.nombre} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                {c.nombre}
              </span>
            ))}
          </div>
        </div>

        {/* Rendimiento */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-slate-700 mb-3">Top conductores por KM</h3>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="pb-2">Conductor</th>
                <th className="pb-2">KM totales</th>
              </tr>
            </thead>
            <tbody>
              {rendimiento.top_conductores_km.map((c) => (
                <tr key={c.conductor} className="border-b last:border-0">
                  <td className="py-1">{c.conductor}</td>
                  <td className="py-1">{c.km_totales}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="font-semibold text-slate-700 mb-3">Top camiones por uso</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="pb-2">Placa</th>
                <th className="pb-2">Usos</th>
                <th className="pb-2">KM</th>
              </tr>
            </thead>
            <tbody>
              {rendimiento.top_camiones_uso.map((c) => (
                <tr key={c.placa} className="border-b last:border-0">
                  <td className="py-1">{c.placa}</td>
                  <td className="py-1">{c.usos}</td>
                  <td className="py-1">{c.km_totales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historial */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-slate-700 mb-3">Historial de jornadas</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="pb-2">Conductor</th>
              <th className="pb-2">Camión</th>
              <th className="pb-2">Inicio</th>
              <th className="pb-2">Fin</th>
              <th className="pb-2">KM</th>
              <th className="pb-2">Horas</th>
              <th className="pb-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((h) => (
              <tr key={h.id} className="border-b last:border-0">
                <td className="py-1">{h.conductor}</td>
                <td className="py-1">{h.camion}</td>
                <td className="py-1">
                  {h.hora_inicio ? new Date(h.hora_inicio).toLocaleString('es-PE') : '—'}
                </td>
                <td className="py-1">
                  {h.hora_fin ? new Date(h.hora_fin).toLocaleString('es-PE') : '—'}
                </td>
                <td className="py-1">{h.km_recorridos}</td>
                <td className="py-1">{parseFloat(h.horas_duracion).toFixed(1)}</td>
                <td className="py-1">
                  <EstadoBadge estado={h.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const colors: Record<string, string> = {
    COMPLETADA: 'bg-green-100 text-green-700',
    EN_PROCESO: 'bg-blue-100 text-blue-700',
    PENDIENTE: 'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[estado] ?? 'bg-slate-100 text-slate-700'}`}>
      {estado}
    </span>
  );
}

export default DashboardGerencial;
