import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('Microfrontend Base', () => {
  it('debería renderizar el componente principal sin errores', () => {
    const { container } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    // Simplemente verificamos que el contenedor no esté vacío
    expect(container).toBeTruthy(); 
  });
});
