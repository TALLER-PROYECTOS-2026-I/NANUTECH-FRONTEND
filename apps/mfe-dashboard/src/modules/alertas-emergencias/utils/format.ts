// Formatea fechas de incidentes con el formato compacto que aparece en los disenios.
export const formatFechaHora = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  const fecha = date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const hora = date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return `${fecha} ${hora}`;
};

// Mantiene la hora de cabecera viva para indicar actualizacion en tiempo real.
export const formatHoraActual = (date: Date): string =>
  date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

// Formatea la fecha larga del encabezado.
export const formatFechaActual = (date: Date): string =>
  date.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

// Muestra coordenadas con precision suficiente para operaciones.
export const formatCoord = (value: number | null): string =>
  typeof value === 'number' ? value.toFixed(6) : 'No disponible';

// Construye un enlace de Google Maps para la posicion GPS.
export const buildMapsUrl = (latitud: number | null, longitud: number | null): string => {
  if (typeof latitud !== 'number' || typeof longitud !== 'number') return 'https://maps.google.com';
  return `https://www.google.com/maps?q=${latitud},${longitud}`;
};
