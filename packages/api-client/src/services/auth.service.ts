// packages/api-client/src/services/auth.service.ts

export interface LoginResponse {
  token: string;
  usuario: { id: number; nombre: string; rol: string };
}

export const mockLogin = async (correo: string, password: string): Promise<LoginResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (correo === 'admin@nanutech.com' && password === '123456') {
        resolve({
          token: 'jwt-falso-123456789',
          usuario: { id: 1, nombre: 'Administrador', rol: 'ADMIN' }
        });
      } else {
        reject(new Error('Correo o contraseña incorrectos'));
      }
    }, 1500);
  });
};

export const mockRecuperarPassword = async (correo: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (correo.includes('@')) {
        resolve('Te hemos enviado un enlace de recuperación a tu correo.');
      } else {
        reject(new Error('Por favor, ingresa un correo válido.'));
      }
    }, 1500);
  });
};