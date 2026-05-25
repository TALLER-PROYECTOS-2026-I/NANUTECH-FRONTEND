import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getEstadisticasConductor, getJornadas } from '@nanutech/api-client';
import { PerfilConductorPage } from '../../../src/modules/perfil-conductor';
import type { ConductorDashboard } from '../../../src/modules/gestión-conductores/types';

// Mockea el api-client para validar el contrato de HU20 sin depender del backend real.
vi.mock('@nanutech/api-client', () => ({
  getEstadisticasConductor: vi.fn(),
  getJornadas: vi.fn(),
}));

// Conductor base que normalmente llega desde HU10 mediante location.state.
const conductor: ConductorDashboard = {
  id: 'cond-1',
  nombre: 'Carlos Mendoza',
  email: 'carlos.mendoza@nanutech.com',
  dni: '70000001',
  licencia: 'A-IIIB-12345678',
  contacto: '+51 999 111 222',
  estadoContrato: 'ACTIVO',
  estadoOperacional: 'EN_RUTA',
  camionAsignado: 'ABC-123',
  activo: true,
};

// Respuesta cruda del endpoint GET /conductores/{id}/estadisticas.
const estadisticasBackend = {
  conductor_id: 'cond-1',
  conductor_nombre: 'Carlos Mendoza',
  total_jornadas: 3,
  jornadas_completadas: 2,
  jornadas_activas: 1,
  horas_totales_trabajadas: 18.5,
  promedio_horas_por_jornada: 6.2,
  estado_actual: 'EN_RUTA',
};

// Jornadas enriquecidas que retorna GET /jornadas?conductor_id=cond-1.
const jornadasBackend = [
  {
    id: 'jor-1',
    fecha: '2026-05-20',
    conductor: 'Carlos Mendoza',
    camion: 'ABC-123 - Volvo FH16',
    contrato: 'CONT-001',
    horario: '08:00 - 10:30',
    km: 120,
    estado: 'COMPLETADA',
    observaciones: 'Entrega completada sin incidentes',
  },
  {
    id: 'jor-2',
    fecha: '2026-05-22',
    conductor: 'Carlos Mendoza',
    camion: 'DEF-456 - Scania R500',
    contrato: 'CONT-002',
    horario: '09:00 - En curso',
    km: 0,
    estado: 'EN_PROCESO',
    observaciones: null,
  },
];

// Renderiza la ficha simulando la navegacion real desde el boton Ver de HU10.
function renderPerfil(stateConductor: ConductorDashboard | null = conductor) {
  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/dashboard/admin/conductores/cond-1',
          state: stateConductor ? { conductor: stateConductor } : null,
        },
      ]}
    >
      <Routes>
        <Route path="/dashboard/admin/conductores" element={<div>Listado HU10</div>} />
        <Route path="/dashboard/admin/conductores/:id" element={<PerfilConductorPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('HU20 - Perfil tecnico del conductor', () => {
  beforeEach(() => {
    // Limpia llamadas entre escenarios para asegurar expectativas independientes.
    vi.clearAllMocks();
    // Devuelve estadisticas exitosas por defecto.
    vi.mocked(getEstadisticasConductor).mockResolvedValue(estadisticasBackend);
    // Devuelve historial exitoso por defecto.
    vi.mocked(getJornadas).mockResolvedValue(jornadasBackend);
  });

  it('renderiza datos personales, estadisticas e historial al cargar la ficha', async () => {
    renderPerfil();

    expect(screen.getByText('Perfil del Conductor')).toBeInTheDocument();
    expect(screen.getByText('Carlos Mendoza')).toBeInTheDocument();
    expect(screen.getByText(/Licencia: A-IIIB-12345678/i)).toBeInTheDocument();
    expect(screen.getByText('70000001')).toBeInTheDocument();
    expect(screen.getByText('+51 999 111 222')).toBeInTheDocument();
    expect(screen.getByText('carlos.mendoza@nanutech.com')).toBeInTheDocument();

    expect(await screen.findByText('Total Jornadas')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('18.5')).toBeInTheDocument();
    expect(screen.getByText('6.2h')).toBeInTheDocument();
    expect(screen.getByText('CONT-001')).toBeInTheDocument();
    expect(screen.getByText('CONT-002')).toBeInTheDocument();
  });

  it('consume el backend con el id de la ruta y filtra jornadas por conductor_id', async () => {
    renderPerfil();

    await waitFor(() => {
      expect(getEstadisticasConductor).toHaveBeenCalledWith('cond-1');
      expect(getJornadas).toHaveBeenCalledWith({ conductor_id: 'cond-1' });
    });
  });

  it('permite filtrar el historial por estado y busqueda', async () => {
    renderPerfil();

    expect(await screen.findByText('CONT-001')).toBeInTheDocument();
    expect(screen.getByText('CONT-002')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Completadas/i }));
    expect(screen.getByText('CONT-001')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('CONT-002')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Todas/i }));
    fireEvent.change(screen.getByPlaceholderText('Buscar por contrato, placa o observaciones...'), {
      target: { value: 'Scania' },
    });

    expect(await screen.findByText('CONT-002')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('CONT-001')).not.toBeInTheDocument();
    });
  });

  it('deduplica jornadas repetidas y no muestra EN_PROCESO al filtrar completadas', async () => {
    vi.mocked(getJornadas).mockResolvedValueOnce([
      ...jornadasBackend,
      {
        ...jornadasBackend[1],
        id: 'jor-2',
      },
    ]);

    renderPerfil();

    expect(await screen.findByText('CONT-001')).toBeInTheDocument();
    expect(screen.getAllByText('CONT-002')).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: /Completadas/i }));

    expect(screen.getByText('CONT-001')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('CONT-002')).not.toBeInTheDocument();
      expect(screen.queryByText('EN_PROCESO')).not.toBeInTheDocument();
    });
  });

  it('muestra salida segura cuando se abre la URL sin conductor enviado desde HU10', async () => {
    renderPerfil(null);

    expect(screen.getByText('No se encontraron datos del conductor.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Volver al listado/i }));
    expect(await screen.findByText('Listado HU10')).toBeInTheDocument();
  });

  it('muestra mensaje de error si falla la carga de estadisticas o jornadas', async () => {
    vi.mocked(getEstadisticasConductor).mockRejectedValueOnce(new Error('API Error'));

    renderPerfil();

    expect(await screen.findByText('No se pudieron cargar los datos del conductor.')).toBeInTheDocument();
  });
});
