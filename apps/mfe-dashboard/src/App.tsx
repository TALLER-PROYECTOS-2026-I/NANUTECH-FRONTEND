import { useEffect, useState } from 'react'
import './App.css'

// Importamos los componentes de nuestra propia librería
import { Button, Card, Input } from '@nanutech/ui-components';

// Definimos cómo luce la data que esperamos del backend
interface DashboardData {
  camionesActivos: number;
  contratosPendientes: number;
  ingresosMensuales: number;
  alertasMantenimiento: number;
}

function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulamos la llamada a la API al cargar el componente
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Hacemos una petición GET a nuestro Mock local
        const response = await fetch('http://localhost:3001/dashboard-data.json');
        const result = await response.json();
        
        // Simulamos un retraso de 1 segundo de red para que se vea real
        setTimeout(() => {
          setData(result.data);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error al cargar la API Mock", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 bg-slate-900 min-h-screen w-full">
      <h2 className="text-2xl font-bold text-sky-400 mb-6">📊 Dashboard Ejecutivo (Mock API)</h2>

      {/* Zona de Búsqueda usando Input y Button de Shadcn */}
      <div className="flex gap-2 mb-8">
        <Input 
          placeholder="Buscar patente de camión..." 
          className="max-w-xs bg-white text-black" 
        />
        <Button variant="default">Buscar</Button>
      </div>
      
      {loading ? (
        <p className="text-slate-400 animate-pulse">Cargando datos desde el servidor...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          
          {/* Tarjeta 1 */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <p className="text-slate-400 font-medium">Camiones Activos</p>
            <h3 className="text-3xl font-bold text-white mt-2">🚚 {data?.camionesActivos}</h3>
          </Card>

          {/* Tarjeta 2 */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <p className="text-slate-400 font-medium">Contratos Pendientes</p>
            <h3 className="text-3xl font-bold text-white mt-2">📄 {data?.contratosPendientes}</h3>
          </Card>

          {/* Tarjeta 3 */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <p className="text-slate-400 font-medium">Alertas Mantenimiento</p>
            <h3 className="text-3xl font-bold text-rose-400 mt-2">⚠️ {data?.alertasMantenimiento}</h3>
          </Card>

          {/* Tarjeta 4 */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <p className="text-slate-400 font-medium">Ingresos Mensuales</p>
            <h3 className="text-3xl font-bold text-lime-400 mt-2">💰 ${data?.ingresosMensuales?.toLocaleString()}</h3>
          </Card>

        </div>
      )}
    </div>
  )
}

export default App