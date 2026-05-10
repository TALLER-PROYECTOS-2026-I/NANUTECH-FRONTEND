import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DetalleContratoPage } from '../../../src/modules/detalle-contrato';

const renderDetalle = () =>
  render(<DetalleContratoPage contratoId="cont-2024-004" onBack={vi.fn()} />);

describe('DetalleContratoPage - HU07', () => {
  it('muestra codigo, cliente, descripcion y rango de vigencia del contrato seleccionado', async () => {
    renderDetalle();

    expect((await screen.findAllByText('CONT-2024-004')).length).toBeGreaterThan(0);
    expect(screen.getByText('Alimentos Premium S.A.C.')).toBeTruthy();
    expect(screen.getByText(/Transporte refrigerado/i)).toBeTruthy();
    expect(screen.getByText(/31 de diciembre de 2023/i)).toBeTruthy();
    expect(screen.getByText(/29 de abril de 2026/i)).toBeTruthy();
  });

  it('permite editar reglas de tarifa y registra el cambio en historial', async () => {
    renderDetalle();

    await screen.findAllByText('CONT-2024-004');
    fireEvent.click(screen.getByRole('button', { name: /Tarifas/i }));
    fireEvent.change(screen.getByLabelText('Tarifa'), { target: { value: '150' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    await waitFor(() => {
      expect(screen.getByText(/Cambios guardados/i)).toBeTruthy();
    });
    expect(screen.getAllByText('Tarifa').length).toBeGreaterThan(0);
    expect(screen.getByText('95')).toBeTruthy();
    expect(screen.getByText('150')).toBeTruthy();
    expect(screen.getByText('127.0.0.1')).toBeTruthy();
  });

  it('cambia de pestañas sin perder el contexto del contrato seleccionado', async () => {
    renderDetalle();

    await screen.findAllByText('CONT-2024-004');
    fireEvent.click(screen.getByRole('button', { name: /Historial/i }));
    expect(screen.getByText('Detalle de Contrato')).toBeTruthy();
    expect(screen.getAllByText('CONT-2024-004').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Camiones/i }));
    expect(screen.getByText(/Camiones Asignados/i)).toBeTruthy();
    expect(screen.getByText('MNO-345')).toBeTruthy();
  });

  it('valida que la fecha de fin no sea menor a la fecha de inicio', async () => {
    renderDetalle();

    await screen.findAllByText('CONT-2024-004');
    fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
    fireEvent.change(screen.getByLabelText('Fecha de Fin'), { target: { value: '2020-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    expect(await screen.findByText(/La fecha de fin no puede ser menor/i)).toBeTruthy();
  });

  it('permite seleccionar multiples camiones mostrando placa y modelo', async () => {
    renderDetalle();

    await screen.findAllByText('CONT-2024-004');
    fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
    fireEvent.click(screen.getByLabelText(/DEF-456/i));

    expect(screen.getByText('Scania R450')).toBeTruthy();
    expect(screen.getByText(/Camiones seleccionados: 2/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));
    await waitFor(() => {
      expect(screen.getByText(/Cambios guardados/i)).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: /Camiones/i }));
    expect(screen.getByText(/Camiones Asignados \(2\)/i)).toBeTruthy();
    expect(screen.getByText('DEF-456')).toBeTruthy();
  });
});
