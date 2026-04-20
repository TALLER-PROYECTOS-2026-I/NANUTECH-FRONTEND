/**
 * Constantes de la aplicación
 * Contiene valores fijos, mensajes de usuario y configuraciones
 */

export const MENSAJES = {
  TURNO_INICIADO_EXITOSO: '¡Turno iniciado exitosamente!',
  TURNO_FINALIZADO_EXITOSO: '¡Turno finalizado exitosamente!',
  NO_JORNADAS_ASIGNADAS: 'No tienes jornadas asignadas',
  /** Sin turno (carga inicial o sin asignación). */
  ESTADO_VACIO_SIN_TURNO:
    'No hay jornadas programadas para hoy. Contacta con tu supervisor para más información.',
  /** Tras finalizar turno: copy alineado al diseño de referencia. */
  ESTADO_VACIO_TRAS_FINALIZAR:
    'No hay jornadas programadas para ti en este momento. Contacta con tu supervisor para más información sobre futuras asignaciones.',
  ERROR_CARGAR_TURNO: 'Error al cargar el turno',
  ERROR_INICIAR_TURNO: 'Error al iniciar el turno',
  ERROR_FINALIZAR_TURNO: 'Error al finalizar el turno',
  SIN_TURNO_ACTIVO: 'No hay turno activo para finalizar',
  CARGANDO_TURNO: 'Cargando tu turno...',
  INICIANDO_TURNO: 'Iniciando turno...',
  FINALIZANDO_TURNO: 'Finalizando turno...',
};

export const ESTADOS_TURNO = {
  PENDIENTE: 'PENDIENTE',
  EN_PROGRESO: 'EN_PROGRESO',
  FINALIZADO: 'FINALIZADO',
  SIN_JORNADA: 'SIN_JORNADA',
} as const;

export const COLORES_REGLAS = {
  ROJO: 'rojo',
  AZUL: 'azul',
  VERDE: 'verde',
  NARANJA: 'naranja',
  MORADO: 'morado',
} as const;

export const LIMITE_CARACTERES_OBSERVACIONES = 500;

export const TIEMPO_AUTO_OCULTAR_NOTIFICACION = 3000; // ms

export const TIEMPO_RECARGA_DESPUES_FINALIZACION = 2000; // ms

/** Datos del bloque de contacto en estado vacío (sin jornada o tras finalizar). */
export const CONTACTO_OPERACIONES = {
  TELEFONO_ETIQUETA: '+56 9 1234 5678',
  TELEFONO_TEL: '+56912345678',
  SUBTITULO: 'Gerente de Operaciones disponible 24/7',
} as const;

export const REGLAS_GENERALES = [
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
] as const;

export const ENDPOINTS = {
  TURNO_ACTUAL: '/api/choferes/turno-actual',
  INICIAR_TURNO: '/api/choferes/turnos/iniciar',
  FINALIZAR_TURNO: (idTurno: string) => `/api/choferes/turnos/${idTurno}/finalizar`,
  HORA_SERVIDOR: '/api/servidor/hora',
} as const;
