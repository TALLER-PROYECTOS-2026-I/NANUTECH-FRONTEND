import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

describe('Dashboard Microfrontend', () => {
  
  beforeEach(() => {
    //Creamos un "doble de acción" (Mock) para la función fetch del navegador
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: [
            { id: 1, nombre: "Camión 1", estado: "disponible" },
            { id: 2, nombre: "Camión 2", estado: "disponible" }
          ]
        })
      })
    ) as unknown as typeof fetch;
  });
  
  it('debería renderizar el título principal correctamente', async () => {
    //Renderizamos el componente
    render(<App />);
    
    //Esperamos a que el título se renderice
    await waitFor(() => {
      const titulo = screen.getByText('Dashboard Ejecutivo');
      expect(titulo).toBeInTheDocument();
    });
  });

});
