import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

if (!BASE_URL) {
  throw new Error('Falta definir VITE_API_URL en el archivo .env');
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('nanutech_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export * from './src/services/auth/auth.service';
export * from './src/services/registrojornada/camiones';
export * from './src/services/registrojornada/conductores';
export * from './src/services/registrojornada/contratos';
export * from './src/services/registrojornada/jornadas';

export default apiClient;