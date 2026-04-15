import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

//Creamos un "doble de acción" (Mock) para la función fetch del navegador
globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      status: "success",
      data: {
        camionesActivos: 50,
        contratosPendientes: 10,
        ingresosMensuales: 200000,
        alertasMantenimiento: 0
      }
    })
  })
) as any;

describe('Dashboard Microfrontend', () => {
  
  it('debería renderizar el título principal correctamente', () => {
    //Renderizamos el componente
    render(<App />);
    
    //Buscamos el título
    const titulo = screen.getByText('Dashboard Ejecutivo')
    
    //Afirmamos que existe
    expect(titulo).toBeInTheDocument();
  });

});