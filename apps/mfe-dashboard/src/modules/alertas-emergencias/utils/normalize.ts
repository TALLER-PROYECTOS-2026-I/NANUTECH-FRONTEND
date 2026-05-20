import type { AlertaApi, IndicadoresAlertas } from '@nanutech/api-client';
import type { Incidente, IndicadoresHu19 } from '../types';

// Convierte indicadores snake_case del backend a camelCase para la UI.
export const normalizeIndicadores = (indicadores: IndicadoresAlertas): IndicadoresHu19 => ({
  panicoActivas: indicadores.panico_activas,
  auxilioPendientes: indicadores.auxilio_pendientes,
  totalResueltas: indicadores.total_resueltas,
  tienePanicoActivo: indicadores.tiene_panico_activo,
});

// Convierte una alerta del backend al modelo local que usa la pantalla.
export const normalizeIncidente = (alerta: AlertaApi): Incidente => ({
  id: alerta.id,
  codigo: alerta.codigo,
  tipo: alerta.tipo,
  estado: alerta.estado,
  severidad: alerta.severidad,
  detalle: alerta.detalle,
  tipoFallaMecanica: alerta.tipo_falla_mecanica,
  latitud: alerta.latitud,
  longitud: alerta.longitud,
  direccion: alerta.direccion,
  fechaHora: alerta.fecha_hora,
  bloqueoSosActivo: alerta.bloqueo_sos_activo,
  conductor: {
    id: alerta.conductor.id,
    nombre: alerta.conductor.nombre_completo,
    telefono: alerta.conductor.telefono,
    dni: alerta.conductor.dni,
  },
  unidad: alerta.unidad
    ? {
        id: alerta.unidad.id,
        placa: alerta.unidad.placa,
        marca: alerta.unidad.marca,
        modelo: alerta.unidad.modelo,
      }
    : null,
  jornadaId: alerta.jornada_id,
  detalleResolucion: alerta.detalle_resolucion,
  servicioTecnicoRealizado: alerta.servicio_tecnico_realizado,
});
