import { describe, expect, it, vi } from 'vitest';
import {
  calcularDiferenciaSegundos,
  formatearFecha,
  formatearTiempoEnSegundos,
  obtenerFechaHoy,
  obtenerHoraActual,
  estáEnFuturo,
} from '../../../src/modules/chofer/utils/tiempoUtils';

describe('tiempoUtils', () => {
  it('formatea segundos en HH:MM:SS y normaliza negativos', () => {
    // Cubre ceros, tiempos con horas, jornadas largas y valores invalidos.
    expect(formatearTiempoEnSegundos(0)).toBe('00:00:00');
    expect(formatearTiempoEnSegundos(3665)).toBe('01:01:05');
    expect(formatearTiempoEnSegundos(86465)).toBe('24:01:05');
    expect(formatearTiempoEnSegundos(-10)).toBe('00:00:00');
  });

  it('calcula diferencias entre timestamps validos', () => {
    // Calcula la duracion esperada entre dos fechas ISO.
    expect(
      calcularDiferenciaSegundos(
        '2026-05-09T10:00:00.000Z',
        '2026-05-09T10:01:30.000Z'
      )
    ).toBe(90);
  });

  it('no devuelve diferencias negativas ni rompe con timestamps invalidos', () => {
    // Silencia el error esperado para probar la rama defensiva.
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(
      calcularDiferenciaSegundos(
        '2026-05-09T10:05:00.000Z',
        '2026-05-09T10:00:00.000Z'
      )
    ).toBe(0);
    expect(calcularDiferenciaSegundos('fecha-invalida', '2026-05-09T10:00:00.000Z')).toBe(0);

    errorSpy.mockRestore();
  });

  it('formatea fechas y hora actual con el reloj controlado', () => {
    // Congela el reloj para que los formatos dependientes de fecha sean estables.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-09T15:45:00.000Z'));

    expect(formatearFecha('2026-05-09T15:45:00.000Z')).toContain('2026');
    expect(obtenerHoraActual()).toMatch(/^\d{2}:\d{2}$/);
    expect(obtenerFechaHoy()).toContain('2026');

    vi.useRealTimers();
  });

  it('detecta fechas futuras', () => {
    // Usa una fecha fija para comparar pasado y futuro sin depender del dia real.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-09T15:45:00.000Z'));

    expect(estáEnFuturo('2026-05-10T15:45:00.000Z')).toBe(true);
    expect(estáEnFuturo('2026-05-08T15:45:00.000Z')).toBe(false);

    vi.useRealTimers();
  });
});
