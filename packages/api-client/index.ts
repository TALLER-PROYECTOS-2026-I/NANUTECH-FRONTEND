import axios from 'axios'; // Importa axios para hacer peticiones HTTP.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Obtiene la URL base del entorno.

export const apiClient = axios.create({ // Crea una instancia de axios con la URL base y el header de contenido. Axios es una librería para hacer peticiones HTTP.
  baseURL: BASE_URL, // Define la URL base de la API.
  headers: {
    'Content-Type': 'application/json', // Define el tipo de contenido de la solicitud.
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('nanutech_token'); // Obtiene el token del localStorage.

  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Bearer es el prefijo estandar para tokens JWT. Agrega el token al header de la solicitud.
  }

  return config; // Retorna la configuración de la solicitud.
});
// Exporta todos los servicios disponibles.
export * from './src/services/auth/auth.service';
export * from './src/services/registrojornada/camiones';
export * from './src/services/registrojornada/conductores';
export * from './src/services/registrojornada/contratos';
export * from './src/services/registrojornada/jornadas';
export * from './src/services/dashboard/dashboard.service';
export * from './src/services/monitoreoCamiones/camionesHu11';
export * from './src/services/conductores/conductoresDashboard';
export * from './src/services/conductores/conductorPerfil';
export * from './src/services/conductores/registrarConductor';
export * from './src/services/alertas/alertas.service'; 
export * from './src/services/dashboard/auditoria.service';
export * from './src/services/seguimiento-jornada/jornadas.service';
export * from './src/services/historial-jornadas/historialJornadas.service';
// HU09: expone los servicios compartidos para resumen, listado y exportacion de Tracking GPS.
export * from './src/services/tracking-gps/trackingGps.service';
// HU08: integracion GPS, plantillas, validacion, importacion y registros reales.
export * from './src/services/gps/gpsIntegration.service';

export default apiClient; // Exporta la instancia de axios para hacer peticiones HTTP.
