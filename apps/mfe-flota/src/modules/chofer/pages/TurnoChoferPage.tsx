
import React, { useEffect, useState } from 'react';
import { TurnoChofer, ReglaGeneralNanuTech } from '../types/turnoChofer.types';
import { turnoChoferService } from '../services/turnoChofer.service';
import { useTiempoTranscurrido } from '../hooks/useTiempoTranscurrido';
import { TarjetaEstado } from '../components/TarjetaEstado';
import { RegeneralNanuTech } from '../components/RegeneralNanuTech';
import { ModalFinalizarTurno } from '../components/ModalFinalizarTurno';
import { EstadoVacio } from '../components/EstadoVacio';
import { NotificacionExitosa } from '../components/NotificacionExitosa';
import { HistorialJornadas } from '../components/HistorialJornadas';

/**
 * Página principal del Chofer de Camión
 * Maneja el flujo completo:
 * 1. PENDIENTE → Mostrar panel con opción de iniciar turno
 * 2. EN_PROGRESO → Mostrar contador activo y opciones de emergencia
 * 3. FINALIZADO → Mostrar mensaje de éxito
 * 4. SIN_JORNADA → Mostrar mensaje "No tienes jornadas asignadas"
 */
export const TurnoChoferPage: React.FC = () => {
  const [turno, setTurno] = useState<TurnoChofer | null>(null);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cargandoFinalizacion, setCargandoFinalizacion] = useState(false);
  const [notificacion, setNotificacion] = useState<{
    visible: boolean;
    mensaje: string;
    tipo: 'exito' | 'error' | 'info';
  }>({ visible: false, mensaje: '', tipo: 'exito' });

  const { tiempoFormateado } = useTiempoTranscurrido(
    turno?.horaInicio,
    turno?.estado === 'EN_PROGRESO'
  );

  const reglas: ReglaGeneralNanuTech[] = [
    {
      id: 'seg-1',
      titulo: 'Seguridad Primero',
      descripcion: 'Respeta los límites de velocidad y las normas de tránsito en todo momento.',
      icono: '⚠️',
      color: 'rojo',
    },
    {
      id: 'pun-1',
      titulo: 'Puntualidad',
      descripcion: 'Inicia y finaliza tu turno a tiempo. Reporta cualquier retraso inmediatamente.',
      icono: '🕐',
      color: 'azul',
    },
    {
      id: 'ins-1',
      titulo: 'Inspección del Vehículo',
      descripcion: 'Verifica el estado del camión antes de iniciar cada jornada.',
      icono: '✓',
      color: 'verde',
    },
    {
      id: 'bot-1',
      titulo: 'Uso de Botones de Emergencia',
      descripcion: 'Solo usa los botones de pánico y auxilio en situaciones reales de emergencia.',
      icono: '🆘',
      color: 'naranja',
    },
    {
      id: 'doc-1',
      titulo: 'Documentación Completa',
      descripcion: 'Completa todas las observaciones y reportes al finalizar tu turno.',
      icono: '📋',
      color: 'morado',
    },
  ];

  const fechaActual = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Cargar turno actual al montar el componente
  useEffect(() => {
    cargarTurnoActual();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-ocultar notificación después de 3 segundos
  useEffect(() => {
    if (!notificacion.visible) return;
    
    const timer = setTimeout(() => {
      setNotificacion((prev) => ({ ...prev, visible: false }));
    }, 3000);
    return () => clearTimeout(timer);
  }, [notificacion.visible]);

  const cargarTurnoActual = async () => {
    try {
      setCargando(true);
      const respuesta = await turnoChoferService.obtenerTurnoActual();

      if (respuesta.success && respuesta.data) {
        setTurno(respuesta.data);
      } else {
        // No hay turno activo, mostrar estado vacío
        setTurno(null);
      }
    } catch (error) {
      console.error('Error cargando turno:', error);
      mostrarNotificacion('Error al cargar el turno', 'error');
    } finally {
      setCargando(false);
    }
  };

  const manejarIniciarTurno = async () => {
    try {
      setCargando(true);
      const respuesta = await turnoChoferService.iniciarTurno();

      if (respuesta.success && respuesta.data) {
        setTurno(respuesta.data);
        mostrarNotificacion(respuesta.mensaje || '¡Turno iniciado!', 'exito');
      } else {
        mostrarNotificacion(
          respuesta.error || 'No se pudo iniciar el turno',
          'error'
        );
      }
    } catch (error) {
      console.error('Error iniciando turno:', error);
      mostrarNotificacion('Error al iniciar el turno', 'error');
    } finally {
      setCargando(false);
    }
  };

  const manejarFinalizarTurno = async (observaciones: string) => {
    try {
      setCargandoFinalizacion(true);

      if (!turno) {
        throw new Error('No hay turno activo');
      }

      const respuesta = await turnoChoferService.finalizarTurno({
        idTurno: turno.id,
        observaciones: observaciones || undefined,
      });

      if (respuesta.success && respuesta.data) {
        setModalAbierto(false);
        setTurno(null);
        mostrarNotificacion(
          `¡Turno finalizado! Duración: ${turnoChoferService.formatearTiempo(respuesta.data.duracionTotal)}`,
          'exito'
        );

        // Recargar después de 2 segundos para mostrar el estado vacío
        setTimeout(() => {
          cargarTurnoActual();
        }, 2000);
      } else {
        mostrarNotificacion(
          respuesta.error || 'No se pudo finalizar el turno',
          'error'
        );
      }
    } catch (error) {
      console.error('Error finalizando turno:', error);
      mostrarNotificacion('Error al finalizar el turno', 'error');
    } finally {
      setCargandoFinalizacion(false);
    }
  };

  const mostrarNotificacion = (
    mensaje: string,
    tipo: 'exito' | 'error' | 'info'
  ) => {
    setNotificacion({ visible: true, mensaje, tipo });
  };

  // Estado de carga
  if (cargando && turno === null) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-600">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"></div>
          <p className="text-sm">Cargando tu turno...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-5">
      <header className="flex flex-col gap-3 border-b border-gray-200 pb-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">Mi Dashboard</p>
          <p className="text-xs capitalize text-gray-500">{fechaActual}</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Dashboard del Conductor</h1>
          <p className="text-sm text-gray-500">Bienvenido Pedro Lopez, gestiona tu jornada y consulta tu rendimiento</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-right shadow-sm">
          <p className="text-[11px] text-gray-500">Ultima actualizacion</p>
          <p className="text-sm font-semibold text-gray-800">
            {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </header>

      {!turno ? (
        <>
          <EstadoVacio
            titulo="No tienes jornadas asignadas"
            descripcion="No hay jornadas programadas para hoy. Contacta con tu supervisor para mas informacion."
          />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <HistorialJornadas />
            <RegeneralNanuTech reglas={reglas} />
          </div>
        </>
      ) : (
        <>
          <TarjetaEstado
            estado={turno.estado}
            nombreConductor={turno.datosJornada.nombreConductor}
            placa={turno.datosJornada.placa}
            idContrato={turno.datosJornada.idContrato}
            fecha={turno.datosJornada.fecha}
            origen={turno.datosJornada.ruta.origen}
            destino={turno.datosJornada.ruta.destino}
            tiempoTranscurrido={tiempoFormateado}
          >
            {turno.estado === 'PENDIENTE' && (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={manejarIniciarTurno}
                disabled={cargando}
              >
                {cargando ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                    Iniciando...
                  </>
                ) : (
                  <>
                    <span>▷</span>
                    INICIAR TURNO
                  </>
                )}
              </button>
            )}

            {turno.estado === 'EN_PROGRESO' && (
              <>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <button className="rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700">
                    SOS PANICO
                  </button>
                  <button className="rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
                    AUXILIO MECANICO
                  </button>
                </div>

                <button className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
                  REGISTRAR COMBUSTIBLE
                </button>

                <button
                  className="rounded-lg border border-rose-400 bg-white px-4 py-3 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={() => setModalAbierto(true)}
                  disabled={cargandoFinalizacion}
                >
                  FINALIZAR TURNO
                </button>
              </>
            )}
          </TarjetaEstado>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Jornadas del Mes</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500">Jornadas completadas</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Horas Trabajadas</p>
              <p className="text-3xl font-bold text-gray-900">0h</p>
              <p className="text-xs text-gray-500">Ultimos 30 dias</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Kilometros Recorridos</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500">km en el mes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <HistorialJornadas />
            <RegeneralNanuTech reglas={reglas} />
          </div>
        </>
      )}

      <ModalFinalizarTurno
        abierto={modalAbierto}
        cargando={cargandoFinalizacion}
        alCancelar={() => setModalAbierto(false)}
        alConfirmar={manejarFinalizarTurno}
      />

      <NotificacionExitosa
        visible={notificacion.visible}
        mensaje={notificacion.mensaje}
        tipo={notificacion.tipo}
      />
    </div>
  );
};
