import { describe, expect, it } from 'vitest';
import {
  esDistraciónValida,
  esTimestampValido,
  sanitizarTexto,
  validarDatosTurno,
  validarObservaciones,
} from '../../../src/modules/chofer/utils/validacionUtils';

describe('validacionUtils', () => {
  it('valida observaciones opcionales y limite de caracteres', () => {
    // Las observaciones son opcionales, pero respetan un maximo configurable.
    expect(validarObservaciones('')).toEqual({ valido: true });
    expect(validarObservaciones('Observacion breve')).toEqual({ valido: true });
    expect(validarObservaciones('x'.repeat(6), 5)).toEqual({
      valido: false,
      error: 'Las observaciones no pueden exceder 5 caracteres',
    });
  });

  it('valida timestamps ISO', () => {
    // Distingue fechas parseables de cadenas invalidas.
    expect(esTimestampValido('2026-05-09T15:45:00.000Z')).toBe(true);
    expect(esTimestampValido('fecha-invalida')).toBe(false);
  });

  it('valida los datos minimos de un turno', () => {
    // Caso valido con datos requeridos para mostrar un turno.
    const turnoValido = {
      datosJornada: {
        nombreConductor: 'Carlos Ramirez',
        idContrato: 'CONT-001',
        ruta: {
          origen: 'Lima',
          destino: 'Callao',
        },
      },
      horaInicio: '2026-05-09T15:45:00.000Z',
    };

    expect(validarDatosTurno(turnoValido)).toEqual({ valido: true, errores: [] });

    // Caso invalido para comprobar acumulacion de errores de formulario.
    const resultado = validarDatosTurno({
      datosJornada: { ruta: {} },
      horaInicio: 'no-es-fecha',
    });

    expect(resultado.valido).toBe(false);
    expect(resultado.errores).toContain('El nombre del conductor es requerido');
    expect(resultado.errores).toContain('El ID de contrato es requerido');
    expect(resultado.errores).toContain('La ruta de origen es requerida');
    expect(resultado.errores).toContain('La ruta de destino es requerida');
    expect(resultado.errores).toContain('El timestamp de inicio es inválido');
  });

  it('sanitiza texto riesgoso para HTML', () => {
    // Escapa caracteres que podrian interpretarse como HTML.
    expect(sanitizarTexto('<script>"x" & y</script>')).toBe(
      '&lt;script&gt;&quot;x&quot; &amp; y&lt;/script&gt;'
    );
  });

  it('valida duraciones razonables', () => {
    // Evita duraciones negativas o superiores al limite permitido.
    expect(esDistraciónValida(3600)).toBe(true);
    expect(esDistraciónValida(-1)).toBe(false);
    expect(esDistraciónValida(25 * 3600)).toBe(false);
    expect(esDistraciónValida(25 * 3600, 26)).toBe(true);
  });
});
