import { describe, expect, it } from 'vitest';
import { normalizeEstadisticas } from '../../../src/modules/perfil-conductor/utils/normalize';

// Prueba unitaria pura para asegurar el mapeo backend snake_case -> frontend camelCase.
describe('HU20 - normalizeEstadisticas', () => {
  it('normaliza las estadisticas del conductor retornadas por el backend', () => {
    // Payload representativo de GET /conductores/{id}/estadisticas.
    const raw = {
      conductor_id: 'cond-1',
      conductor_nombre: 'Carlos Mendoza',
      total_jornadas: 5,
      jornadas_completadas: 4,
      jornadas_activas: 1,
      horas_totales_trabajadas: 32.5,
      promedio_horas_por_jornada: 6.5,
      estado_actual: 'EN_RUTA',
    };

    // Valida que los componentes reciban nombres de propiedad consistentes.
    expect(normalizeEstadisticas(raw)).toEqual({
      totalJornadas: 5,
      jornadasCompletadas: 4,
      jornadasActivas: 1,
      horasTotalesTrabajadas: 32.5,
      promedioHorasPorJornada: 6.5,
      estadoActual: 'EN_RUTA',
    });
  });
});
