import { useEffect, useMemo, useState } from 'react';
import {
  getContratos,
  getContratosVigentes,
  getIndicadoresContratos,
  type ContratosIndicadores,
} from '@nanutech/api-client';
import {
  ChartCard,
  ContractDetailPanel,
  ContractsTable,
  EstadoPieChart,
  ExpirationAlert,
  KpiCard,
  ModuleBanner,
  PageHeader,
  TipoServicioBarChart,
} from '../components/GestionContratosComponents';
import { emptyIndicadores, PAGE_SIZE } from '../constants';
import type { ContratoConUnidades, EstadoFiltro, GestionContratosPageProps, SortDirection } from '../types';
import { buildIndicadoresFromContratos, getNormalizedEstado } from '../utils/indicadores';

/**
 * HU06 - Panel de Gestion de Contratos Comerciales.
 *
 * Esta pagina concentra la experiencia principal:
 * - carga contratos desde API,
 * - muestra indicadores y graficas,
 * - permite busqueda, filtro, ordenamiento y paginacion,
 * - abre una vista expandida cuando el usuario presiona Ver.
 */
export default function GestionContratosPage({ onNuevoContrato, onVerContrato }: GestionContratosPageProps) {
  // Lista base usada por indicadores, filtros, tabla y detalle.
  const [contratos, setContratos] = useState<ContratoConUnidades[]>([]);

  // Indicadores devueltos por API; si no llegan, se calculan localmente desde contratos.
  const [indicadores, setIndicadores] = useState<ContratosIndicadores>(emptyIndicadores);

  // Estado de UI para carga, busqueda, filtros, orden y paginacion.
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EstadoFiltro>('TODOS');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  // Contrato seleccionado para mostrar la vista expandida solicitada en el CA5.
  const [selectedContrato, setSelectedContrato] = useState<ContratoConUnidades | null>(null);

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

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        // La consulta principal ya pide paginacion 10/10 y orden por vencimiento.
        const [listResult, indicadoresResult] = await Promise.allSettled([
          getContratos({ page: 1, limit: PAGE_SIZE, order_by: 'fecha_fin' }),
          getIndicadoresContratos(),
        ]);

        // Si falla el listado general, intenta el endpoint de vigentes como respaldo.
        const nextContratos =
          listResult.status === 'fulfilled'
            ? listResult.value.data
            : await getContratosVigentes();

        if (!active) return;
        setContratos(nextContratos);
        setIndicadores(
          indicadoresResult.status === 'fulfilled'
            ? indicadoresResult.value
            : buildIndicadoresFromContratos(nextContratos)
        );
      } catch {
        if (!active) return;
        setContratos([]);
        setIndicadores(emptyIndicadores);
        setErrorMessage(
          'No se pudieron cargar los contratos desde el servidor. Verifique la conexion o intente nuevamente.'
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  // Indicadores calculados en cliente cuando el backend no envia el resumen.
  const derivedIndicadores = useMemo(() => buildIndicadoresFromContratos(contratos), [contratos]);
  const dashboardIndicadores = indicadores.total_contratos ? indicadores : derivedIndicadores;

  // Las graficas necesitan distribuciones completas. Si el backend aun no las entrega bien,
  // se usan las distribuciones calculadas desde los contratos cargados.
  const chartIndicadores = useMemo(() => {
    const hasEstadoDistribution = dashboardIndicadores.distribucion_por_estado.some(
      (item) => Boolean(item.estado) && Number(item.cantidad) > 0
    );
    const hasTipoDistribution = dashboardIndicadores.distribucion_por_tipo_servicio.some(
      (item) => Boolean(item.tipo_servicio) && Number(item.cantidad) > 0
    );

    return {
      estado: hasEstadoDistribution
        ? dashboardIndicadores.distribucion_por_estado
        : derivedIndicadores.distribucion_por_estado,
      tipoServicio: hasTipoDistribution
        ? dashboardIndicadores.distribucion_por_tipo_servicio
        : derivedIndicadores.distribucion_por_tipo_servicio,
    };
  }, [dashboardIndicadores, derivedIndicadores]);

  // Contratos proximos a vencer para la alerta superior.
  const proximos = contratos.filter((contrato) => contrato.proximo_a_vencer).slice(0, 2);

  // Aplica busqueda por codigo/cliente, filtro por estado y ordenamiento por fecha fin.
  const filteredContratos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return contratos
      .filter((contrato) => {
        const matchesQuery =
          !normalizedQuery ||
          `${contrato.codigo || ''} ${contrato.cliente}`.toLowerCase().includes(normalizedQuery);
        const estado = getNormalizedEstado(contrato);
        const matchesStatus = statusFilter === 'TODOS' || estado === statusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        const first = new Date(a.fecha_fin || '9999-12-31').getTime();
        const second = new Date(b.fecha_fin || '9999-12-31').getTime();
        return sortDirection === 'asc' ? first - second : second - first;
      });
  }, [contratos, query, sortDirection, statusFilter]);

  // Paginacion local de 10 en 10 para mantener la tabla liviana.
  const totalPages = Math.max(1, Math.ceil(filteredContratos.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedContratos = filteredContratos.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Al cambiar busqueda o filtro vuelve a la primera pagina.
  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  const handleView = (contrato: ContratoConUnidades) => {
    // Si App entrega navegacion real, envia el id al modulo detalle-contrato.
    // Si no existe callback, mantiene el panel expandido como fallback local de HU06.
    if (onVerContrato) {
      onVerContrato(contrato.id);
      return;
    }

    setSelectedContrato(contrato);
  };

  return (
    <main className="space-y-6">
      <ModuleBanner indicadores={dashboardIndicadores} />
      <PageHeader currentTime={currentTime} onNuevoContrato={onNuevoContrato} />

      {loading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
          Cargando contratos...
        </div>
      ) : (
        <>
          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total Contratos" value={dashboardIndicadores.total_contratos} hint="Registrados en el sistema" tone="blue" icon="file" />
            <KpiCard label="Contratos Activos" value={dashboardIndicadores.contratos_activos} hint={`${dashboardIndicadores.contratos_activos} vigentes sin expirar`} tone="green" icon="check" />
            <KpiCard label="Contratos Vencidos" value={dashboardIndicadores.contratos_vencidos} hint={`${dashboardIndicadores.proximos_a_vencer} por expirar (30 dias)`} tone="red" icon="x" />
            <KpiCard label="Camiones Asignados" value={dashboardIndicadores.camiones_asignados} hint="En contratos vigentes" tone="purple" icon="truck" />
          </section>

          <ExpirationAlert contratos={proximos} onView={handleView} />

          <section className="grid gap-6 xl:grid-cols-2">
            <ChartCard title="Distribucion por Estado" subtitle="Estado actual de los contratos">
              <EstadoPieChart items={chartIndicadores.estado} />
            </ChartCard>
            <ChartCard title="Tipo de Servicio" subtitle="Distribucion de contratos por modalidad">
              <TipoServicioBarChart items={chartIndicadores.tipoServicio} />
            </ChartCard>
          </section>

          {selectedContrato && (
            <ContractDetailPanel contrato={selectedContrato} onClose={() => setSelectedContrato(null)} />
          )}

          <ContractsTable
            contratos={paginatedContratos}
            allCount={filteredContratos.length}
            query={query}
            statusFilter={statusFilter}
            sortDirection={sortDirection}
            currentPage={currentPage}
            totalPages={totalPages}
            onQueryChange={setQuery}
            onStatusChange={setStatusFilter}
            onSortChange={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
            onPageChange={setPage}
            onView={handleView}
          />
        </>
      )}
    </main>
  );
}
