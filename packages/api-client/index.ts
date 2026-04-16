import axios from 'axios';

// Accedemos a las propiedades como si fuera un diccionario genérico
// Esto hace que TypeScript NO lo valide y por lo tanto NO lance errores
const getBaseUrl = (): string => {
  try {
    // Intentamos obtener de Vite (import.meta.env)
    const viteEnv = (import.meta as any)['env'];
    if (viteEnv && viteEnv['VITE_API_URL']) return viteEnv['VITE_API_URL'];

    // Intentamos obtener de Node (process.env)
    const nodeEnv = (globalThis as any)['process']?.['env'];
    if (nodeEnv && nodeEnv['VITE_API_URL']) return nodeEnv['VITE_API_URL'];
  } catch (e) {
    // Si algo falla, no rompemos la app
  }

  // URL de respaldo (Hardcoded para que siempre funcione en tus pruebas)
  return 'https://wbda73ufn9.execute-api.us-east-2.amazonaws.com/dev';
};

const BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ejemplo de funciones para consumir la API (puedes expandir esto según tus necesidades)
export const getCamiones = () => apiClient.get('/camiones');
export const getUsuarios = () => apiClient.get('/items');

// Exportamos todo lo que hay en los servicios para que sea fácil de importar desde otros módulos
export * from './src/services/jornadas';

// Mock functions para autenticación
export const mockLogin = async (correo: string, password: string) => {
  // Simula una solicitud de login
  return {
    success: true,
    data: {
      token: 'mock-token-' + Date.now(),
      usuario: { correo, id: 'user-1', rol: 'CHOFER' },
    },
  };
};

export const mockRecuperarPassword = async (correo: string) => {
  // Simula una solicitud de recuperación de contraseña
  return {
    success: true,
    mensaje: 'Se ha enviado un correo de recuperación a ' + correo,
  };
};


export default apiClient;