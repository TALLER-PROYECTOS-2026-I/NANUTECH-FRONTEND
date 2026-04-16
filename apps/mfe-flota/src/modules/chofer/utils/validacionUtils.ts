/**
 * Utilidades para validación de datos
 */

/**
 * Valida que las observaciones cumplan con los requisitos
 *
 * @param observaciones - String con las observaciones
 * @param limiteCaracteres - Número máximo de caracteres permitidos
 * @returns Objeto con validación
 */
export const validarObservaciones = (
  observaciones: string,
  limiteCaracteres: number = 500
): { valido: boolean; error?: string } => {
  if (!observaciones || observaciones.trim().length === 0) {
    return { valido: true }; // Las observaciones son opcionales
  }

  if (observaciones.length > limiteCaracteres) {
    return {
      valido: false,
      error: `Las observaciones no pueden exceder ${limiteCaracteres} caracteres`,
    };
  }

  return { valido: true };
};

/**
 * Valida que un timestamp ISO sea válido
 *
 * @param timestamp - String con el timestamp en formato ISO
 * @returns boolean indicando si es válido
 */
export const esTimestampValido = (timestamp: string): boolean => {
  try {
    const fecha = new Date(timestamp);
    return !isNaN(fecha.getTime());
  } catch {
    return false;
  }
};

/**
 * Valida que los datos mínimos de un turno sean válidos
 *
 * @param turno - Objeto con datos del turno
 * @returns Objeto con validación
 */
export const validarDatosTurno = (turno: Record<string, unknown>): { valido: boolean; errores: string[] } => {
  const errores: string[] = [];

  const datosJornada = turno.datosJornada as Record<string, unknown>;
  if (!String(datosJornada?.nombreConductor).trim()) {
    errores.push('El nombre del conductor es requerido');
  }

  if (!String(datosJornada?.idContrato).trim()) {
    errores.push('El ID de contrato es requerido');
  }

  const ruta = datosJornada?.ruta as Record<string, unknown>;
  if (!String(ruta?.origen).trim()) {
    errores.push('La ruta de origen es requerida');
  }

  if (!String(ruta?.destino).trim()) {
    errores.push('La ruta de destino es requerida');
  }

  if (turno.horaInicio && !esTimestampValido(String(turno.horaInicio))) {
    errores.push('El timestamp de inicio es inválido');
  }

  return {
    valido: errores.length === 0,
    errores,
  };
};

/**
 * Sanitiza texto eliminando caracteres peligrosos para XSS
 *
 * @param texto - String a sanitizar
 * @returns String sanitizado
 */
export const sanitizarTexto = (texto: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return texto.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * Valida que una duración en segundos sea razonable
 *
 * @param segundos - Duración en segundos
 * @param maxHoras - Número máximo de horas permitidas (por defecto 24)
 * @returns boolean indicando si la duración es válida
 */
export const esDistraciónValida = (segundos: number, maxHoras: number = 24): boolean => {
  const maxSegundos = maxHoras * 3600;
  return segundos >= 0 && segundos <= maxSegundos;
};
