import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

vi.stubGlobal('localStorage', {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
});

describe('Shell App', () => {
  it('deberia renderizar el componente principal sin errores', () => {
    const { container } = render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>,
    );

    expect(container).toBeTruthy();
  });

  it('crea el arbol de rutas de la aplicacion', () => {
    expect(App()).toBeTruthy();
  });
});
