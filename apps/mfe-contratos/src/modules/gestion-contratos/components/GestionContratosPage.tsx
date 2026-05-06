import { useState, useMemo } from 'react';
import { Contrato } from '../types';
import { mockContratos, calcularResumen, calcularDatosGraficaEstado, calcularDatosGraficaTipoServicio } from '../mockData';
import { obtenerContratos } from '../services';
import { ResumenTarjetas } from './ResumenTarjetas';
import { GraficaContratos } from './GraficaContratos';
import { TablaContratos } from './TablaContratos';

export const GestionContratosPage: React.FC = () => {
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');

  // Obtener datos con paginación y búsqueda
  const datosTabla = useMemo(() => {
    return obtenerContratos(pagina, 10, busqueda);
  }, [pagina, busqueda]);

  // Calcular datos de resumen
  const datosResumen = useMemo(() => {
    return calcularResumen(mockContratos);
  }, []);

  // Calcular datos de gráficas
  const datosGraficaEstado = useMemo(() => {
    return calcularDatosGraficaEstado(mockContratos);
  }, []);

  const datosGraficaTipoServicio = useMemo(() => {
    return calcularDatosGraficaTipoServicio(mockContratos);
  }, []);

  // Manejadores de eventos
  const handleVerContrato = (contrato: Contrato) => {
    // Redirigir a detalle del contrato
    console.log('Ver contrato:', contrato);
    // En un caso real, esto sería:
    // navigate(`/contratos/${contrato.id}`);
    alert(`Redirigiendo a detalle de: ${contrato.codigo} - ${contrato.cliente}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Gestión de Contratos</h1>
              <p className="text-blue-100 mt-2">
                Administración y seguimiento de contratos comerciales
              </p>
            </div>
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              + Nuevo Contrato
            </button>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tarjetas de Resumen */}
        <ResumenTarjetas datos={datosResumen} />

        {/* Gráficas */}
        <GraficaContratos
          datosEstado={datosGraficaEstado}
          datosTipoServicio={datosGraficaTipoServicio}
        />

        {/* Tabla de Contratos */}
        <TablaContratos
          datos={datosTabla}
          pagina={pagina}
          busqueda={busqueda}
          onPaginaChange={setPagina}
          onBusquedaChange={setBusqueda}
          onVer={handleVerContrato}
        />
      </div>
    </div>
  );
};
