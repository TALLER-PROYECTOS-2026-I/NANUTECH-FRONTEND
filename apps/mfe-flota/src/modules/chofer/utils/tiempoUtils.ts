/**
 * Utilidades para manejo de tiempos y fechas
 * Funciones de formato y conversión
 */

/**
 * Convierte una cantidad de segundos a formato HH:MM:SS
 * Soporta duraciones mayores a 24 horas
 *
 * @param segundos - Total de segundos
 * @returns String en formato HH:MM:SS
 *
 * @example
 * formatearTiempoEnSegundos(3665) // "01:01:05"
 * formatearTiempoEnSegundos(86465) // "24:01:05"
 */
export const formatearTiempoEnSegundos = (segundos: number): string => {
  if (segundos < 0) segundos = 0;

  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs = segundos % 60;

  const formatoHora = horas.toString().padStart(2, '0');
  const formatoMinuto = minutos.toString().padStart(2, '0');
  const formatoSegundo = segs.toString().padStart(2, '0');

  return `${formatoHora}:${formatoMinuto}:${formatoSegundo}`;
};

/**
 * Calcula la diferencia en segundos entre dos timestamps ISO
 * IMPORTANTE: Usar siempre timestamps del servidor, nunca del dispositivo local
 *
 * @param horaInicio - ISO timestamp del servidor
 * @param horaActual - ISO timestamp actual del servidor
 * @returns Duración en segundos
 *
 * @example
 * calcularDiferenciaSegundos('2026-04-07T10:00:00Z', '2026-04-07T10:01:00Z') // 60
 */
export const calcularDiferenciaSegundos = (horaInicio: string, horaActual: string): number => {
  try {
    const inicio = new Date(horaInicio);
    const actual = new Date(horaActual);

    if (isNaN(inicio.getTime()) || isNaN(actual.getTime())) {
      throw new Error('Timestamp inválido');
    }

    const diferencia = Math.floor((actual.getTime() - inicio.getTime()) / 1000);
    return Math.max(0, diferencia);
  } catch (error) {
    console.error('Error calculando diferencia de segundos:', error);
    return 0;
  }
};

/**
 * Formatea una fecha ISO a un string legible en español
 *
 * @param fechaISO - String con fecha en formato ISO
 * @param opciones - Opciones de formato (opcional)
 * @returns String formateado con la fecha
 *
 * @example
 * formatearFecha('2026-04-07T10:00:00Z') // "martes, 7 de abr de 2026"
 */
export const formatearFecha = (
  fechaISO: string,
  opciones?: Intl.DateTimeFormatOptions
): string => {
  try {
    const fecha = new Date(fechaISO);

    if (isNaN(fecha.getTime())) {
      throw new Error('Fecha inválida');
    }

    const opcionesDefault: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };

    return fecha.toLocaleDateString('es-PE', opciones || opcionesDefault);
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return '';
  }
};

/**
 * Obtiene la hora actual en formato HH:MM
 * Útil para mostrar la hora en la UI
 *
 * @returns String con la hora en formato HH:MM
 *
 * @example
 * obtenerHoraActual() // "14:30"
 */
export const obtenerHoraActual = (): string => {
  const ahora = new Date();
  const horas = ahora.getHours().toString().padStart(2, '0');
  const minutos = ahora.getMinutes().toString().padStart(2, '0');
  return `${horas}:${minutos}`;
};

/**
 * Verifica si una fecha está en el futuro
 *
 * @param fechaISO - String con fecha en formato ISO
 * @returns true si la fecha está en el futuro, false en caso contrario
 */
export const estáEnFuturo = (fechaISO: string): boolean => {
  try {
    const fecha = new Date(fechaISO);
    const ahora = new Date();
    return fecha > ahora;
  } catch (error) {
    console.error('Error verificando fecha futura:', error);
    return false;
  }
};

/**
 * Obtiene la fecha de hoy en formato local español
 *
 * @returns String con la fecha de hoy formateada
 *
 * @example
 * obtenerFechaHoy() // "martes, 7 de abr de 2026"
 */
export const obtenerFechaHoy = (): string => {
  return formatearFecha(new Date().toISOString());
};
