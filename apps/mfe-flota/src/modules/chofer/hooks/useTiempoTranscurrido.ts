import { useEffect, useState } from 'react';
import { turnoChoferService } from '../services/turnoChofer.service';

/**
 * Hook personalizado para manejar el contador de tiempo transcurrido
 * Sincroniza con la hora del servidor cada segundo para evitar manipulaciones
 *
 * @param horaInicio - ISO timestamp del servidor cuando comenzó el turno
 * @param activo - Si el contador debe estar activo
 * @returns Objeto con tiempo formateado y tiempo en segundos
 */
export const useTiempoTranscurrido = (horaInicio: string | undefined, activo: boolean) => {
  const [tiempoFormateado, setTiempoFormateado] = useState<string>('00:00:00');
  const [tiempoSegundos, setTiempoSegundos] = useState<number>(0);

  useEffect(() => {
    if (!activo || !horaInicio) {
      return;
    }

    // Actualizar cada segundo
    const intervalo = setInterval(async () => {
      try {
        const horaActual = await turnoChoferService.obtenerHoraServidor();
        const segundos = turnoChoferService.calcularTiempoTranscurrido(horaInicio, horaActual);

        setTiempoSegundos(segundos);
        setTiempoFormateado(turnoChoferService.formatearTiempo(segundos));
      } catch (error) {
        console.error('Error actualizando tiempo:', error);
      }
    }, 1000);

    // Limpieza
    return () => clearInterval(intervalo);
  }, [horaInicio, activo]);

  return {
    tiempoFormateado,
    tiempoSegundos,
  };
};
