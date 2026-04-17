import { describe, it, expect } from 'vitest';
import { validarFormatoCorreo } from './validators';

describe('Validators - validarFormatoCorreo', () => {
  
  it('debería retornar true para emails válidos', () => {
    const emailsValidos = [
      'usuario@nanutech.com',
      'admin@company.com',
      'chofer.juan@transporte.co',
      'email+tag@domain.com',
      'user123@example.org',
    ];

    emailsValidos.forEach(email => {
      expect(validarFormatoCorreo(email)).toBe(true);
    });
  });

  it('debería retornar false para emails inválidos sin @', () => {
    const emailsInvalidos = [
      'usuarionanutech.com',
      'admin',
      'test',
    ];

    emailsInvalidos.forEach(email => {
      expect(validarFormatoCorreo(email)).toBe(false);
    });
  });

  it('debería retornar false para emails sin dominio', () => {
    const emailsInvalidos = [
      'usuario@',
      'usuario@.com',
      '@nanutech.com',
    ];

    emailsInvalidos.forEach(email => {
      expect(validarFormatoCorreo(email)).toBe(false);
    });
  });

  it('debería retornar false para emails con espacios', () => {
    const emailsInvalidos = [
      'usuario @nanutech.com',
      'usuario@ nanutech.com',
      'usuario @nanutech .com',
    ];

    emailsInvalidos.forEach(email => {
      expect(validarFormatoCorreo(email)).toBe(false);
    });
  });

  it('debería retornar false para strings vacíos', () => {
    expect(validarFormatoCorreo('')).toBe(false);
  });

  it('debería retornar false para espacios en blanco', () => {
    expect(validarFormatoCorreo('   ')).toBe(false);
  });
});
