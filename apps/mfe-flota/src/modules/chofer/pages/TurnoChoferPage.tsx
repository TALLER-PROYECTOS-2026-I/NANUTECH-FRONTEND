
import React, { useEffect, useState } from 'react';
import { TurnoChofer, ReglaGeneralNanuTech } from '../types/turnoChofer.types';
import { turnoChoferService } from '../services/turnoChofer.service';
import { useTiempoTranscurrido } from '../hooks/useTiempoTranscurrido';
import { TarjetaEstado } from '../components/TarjetaEstado';
import { RegeneralNanuTech } from '../components/RegeneralNanuTech';
import { ModalFinalizarTurno } from '../components/ModalFinalizarTurno';
import { EstadoVacio } from '../components/EstadoVacio';
import { NotificacionExitosa } from '../components/NotificacionExitosa';
import '../styles/TurnoChoferPage.css';

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
      <div className="pagina-turno pagina-turno--cargando">
        <div className="spinner-contenedor">
          <div className="spinner"></div>
          <p>Cargando tu turno...</p>
        </div>
      </div>
    );
  }

  // Estado sin jornada asignada
  if (!turno) {
    return (
      <div className="pagina-turno">
        <h1 className="pagina-titulo">Dashboard del Conductor</h1>
        <EstadoVacio
          titulo="No tienes jornadas asignadas"
          descripcion="No hay jornadas programadas para hoy. Contacta con tu supervisor para más información."
        />
        <RegeneralNanuTech reglas={reglas} />
      </div>
    );
  }

  return (
    <div className="pagina-turno">
      <h1 className="pagina-titulo">Dashboard del Conductor</h1>

      {/* Tarjeta de Estado */}
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
            className="btn btn--primario btn--grande"
            onClick={manejarIniciarTurno}
            disabled={cargando}
          >
            {cargando ? (
              <>
                <span className="spinner"></span>
                Iniciando...
              </>
            ) : (
              <>
                <span className="icono">▶</span>
                INICIAR TURNO
              </>
            )}
          </button>
        )}

        {turno.estado === 'EN_PROGRESO' && (
          <>
            <div className="acciones-emergencia">
              <button className="btn btn--peligro btn--emergencia">
                <span className="icono">🚨</span>
                SOS PÁNICO
              </button>
              <button className="btn btn--advertencia btn--emergencia">
                <span className="icono">🔧</span>
                AUXILIO MECÁNICO
              </button>
            </div>

            <button className="btn btn--combustible">
              <span className="icono">⛽</span>
              REGISTRAR COMBUSTIBLE
            </button>

            <button
              className="btn btn--secundario btn--grande"
              onClick={() => setModalAbierto(true)}
              disabled={cargandoFinalizacion}
            >
              <span className="icono">⏹</span>
              FINALIZAR TURNO
            </button>
          </>
        )}
      </TarjetaEstado>

      {/* Tarjeta de Estadísticas */}
      {turno.estado !== 'EN_PROGRESO' && (
        <div className="estadisticas">
          <div className="estadistica-card">
            <div className="estadistica-numero">13</div>
            <div className="estadistica-label">Jornadas del Mes</div>
            <div className="estadistica-detalle">completadas</div>
          </div>

          <div className="estadistica-card">
            <div className="estadistica-numero">93h</div>
            <div className="estadistica-label">Horas Trabajadas</div>
            <div className="estadistica-detalle">Últimos 30 días</div>
          </div>

          <div className="estadistica-card">
            <div className="estadistica-numero">3467</div>
            <div className="estadistica-label">Kilómetros Recorridos</div>
            <div className="estadistica-detalle">km en el mes</div>
          </div>
        </div>
      )}

      {/* Reglas Generales */}
      <RegeneralNanuTech reglas={reglas} />

      {/* Modal Finalizar Turno */}
      <ModalFinalizarTurno
        abierto={modalAbierto}
        cargando={cargandoFinalizacion}
        alCancelar={() => setModalAbierto(false)}
        alConfirmar={manejarFinalizarTurno}
      />

      {/* Notificaciones */}
      <NotificacionExitosa
        visible={notificacion.visible}
        mensaje={notificacion.mensaje}
        tipo={notificacion.tipo}
      />
    </div>
  );
};
