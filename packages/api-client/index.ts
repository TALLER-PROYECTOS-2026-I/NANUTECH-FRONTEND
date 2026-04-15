import axios from 'axios';

// Accedemos a las propiedades como si fuera un diccionario genérico
// Esto hace que TypeScript NO lo valide y por lo tanto NO lance errores
const getBaseUrl = (): string => {
  try {
    const viteEnv = (import.meta as any)['env'];
    // Si se define VITE_API_URL explícitamente (producción), la usamos
    if (viteEnv && viteEnv['VITE_API_URL']) return viteEnv['VITE_API_URL'];

    const nodeEnv = (globalThis as any)['process']?.['env'];
    if (nodeEnv && nodeEnv['VITE_API_URL']) return nodeEnv['VITE_API_URL'];
  } catch (e) {
    // Si algo falla, no rompemos la app
  }

  // Por defecto usamos el proxy de Vite (/api → AWS) para evitar CORS en desarrollo
  // En producción, configurar VITE_API_URL en las variables de entorno
  return '/api';
};

const BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: adjunta el token automáticamente en cada request
apiClient.interceptors.request.use((config) => {
  try {
    const token = (globalThis as any)['localStorage']?.getItem('nanutech_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {
    // localStorage no disponible (SSR/tests), se omite
  }
  return config;
});

// Funciones de prueba / utilitarias
export const getCamiones = () => apiClient.get('/camiones');
export const getUsuarios = () => apiClient.get('/items');

// Servicios
export * from './src/services/auth.service';

export default apiClient;