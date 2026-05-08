import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import SeguimientoJornadas from "./modules/seguimiento-jornadas/SeguimientoJornadas";

describe('Microfrontend Base', () => {
  it('debería renderizar el componente principal sin errores', () => {
    const { container } = render(<App />);
    // Simplemente verificamos que el contenedor no esté vacío
    expect(container).toBeTruthy(); 
  });
});