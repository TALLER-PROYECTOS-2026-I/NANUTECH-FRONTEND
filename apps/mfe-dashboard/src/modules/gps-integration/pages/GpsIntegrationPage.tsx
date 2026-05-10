import { useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
  ADMIN_DASHBOARD_HOME,
  adminNavItems,
  adminNavLinkClassName,
} from "../../../navigation/adminNav";
import { AdminSidebarSession } from "../../../components/AdminSidebarSession";

function GpsIntegrationPage() {


  const [provider, setProvider] = useState("");

  const [validated, setValidated] = useState(false);
  const [imported, setImported] = useState(false);
  const [filterProveedor, setFilterProveedor] = useState("");
  const [filterPlaca, setFilterPlaca] = useState("");

  /* ───── DESCARGAR PLANTILLA CSV ───── */
  const downloadTemplate = () => {
  const headers =
    "fecha,hora,placa,latitud,longitud,velocidad,rumbo,distancia_total\n";

  const example =
    "2026-05-08,10:30,ABC-123,-12.05,-77.04,65,120,5\n";

  const blob = new Blob([headers + example], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla_gps.csv";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  window.URL.revokeObjectURL(url);
};

  /* ───── MOCK GPS DATA ───── */
  const gpsData = [
    { placa: "ABC-123", estado: "EN MOVIMIENTO", proveedor: "GPSControl.pe", fecha: "2026-05-08 10:30", km: 120, lat: -12.05, lng: -77.04, velocidad: 65 },
    { placa: "DEF-456", estado: "EXCESO VELOCIDAD", proveedor: "GlobalGPSPeru.com", fecha: "2026-05-08 10:32", km: 98, lat: -12.06, lng: -77.03, velocidad: 110 },
    { placa: "GHI-789", estado: "DETENIDO", proveedor: "GPSControl.pe", fecha: "2026-05-08 10:35", km: 200, lat: -12.07, lng: -77.02, velocidad: 0 },
  ];

  /* ───── KPIs ───── */
  const kpis = useMemo(() => {
    const total = gpsData.length;
    const moving = gpsData.filter(g => g.estado === "EN MOVIMIENTO").length;
    const stopped = gpsData.filter(g => g.estado === "DETENIDO").length;
    const speedAvg = total ? Math.round(gpsData.reduce((a, b) => a + b.velocidad, 0) / total) : 0;

    return {
      total,
      moving,
      stopped,
      movingPct: total ? Math.round((moving / total) * 100) : 0,
      speedAvg,
    };
  }, []);

  /* ───── VALIDACION CSV SIMULADA ───── */
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
  const f = e.target.files?.[0] || null;

    if (f) {
      // simulación validación columnas
      const valid = f.name.toLowerCase().includes("gps");
      setValidated(valid);
    } else {
      setValidated(false);
    }
  };

  const handleImport = () => {
    setImported(true);
  };

  const filteredData = gpsData.filter(d =>
    (!filterProveedor || d.proveedor === filterProveedor) &&
    (!filterPlaca || d.placa.includes(filterPlaca))
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">

      {/* ───── SIDEBAR (IGUAL AL DASHBOARD) ───── */}
      <aside className="w-52 shrink-0 bg-slate-900 flex flex-col min-h-screen fixed top-0 left-0 z-20">

        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" rx="1"/>
              <path d="M16 8h4l3 5v4h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm">NANU TECH</p>
            <p className="text-slate-400 text-xs">Gestión de Flota</p>
          </div>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-4">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === ADMIN_DASHBOARD_HOME}
              className={({ isActive }) =>
                adminNavLinkClassName(isActive, item.accentWhenActive)
              }
            >
              <span className="shrink-0 text-current">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <AdminSidebarSession />
      </aside>

      {/* ───── MAIN ───── */}
      <div className="ml-52 flex-1 p-6">

        <h1 className="text-2xl font-bold">Integración GPS</h1>
        <p className="text-gray-500 mt-1">Monitoreo y carga masiva de datos GPS</p>
	
{/* KPI CARDS */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-xl border">
            <p className="text-sm text-gray-500">Total Registros</p>
            <p className="text-2xl font-bold">{kpis.total}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border">
            <p className="text-sm text-gray-500">En Movimiento</p>
            <p className="text-2xl font-bold">{kpis.moving} ({kpis.movingPct}%)</p>
          </div>

          <div className="bg-white p-4 rounded-xl border">
            <p className="text-sm text-gray-500">Detenidos</p>
            <p className="text-2xl font-bold">{kpis.stopped}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border">
            <p className="text-sm text-gray-500">Velocidad Prom.</p>
            <p className="text-2xl font-bold">{kpis.speedAvg} km/h</p>
          </div>
        </div>
{/* ───── NUEVO BLOQUE UI ───── */}
        <div className="mt-5 bg-white border rounded-xl overflow-hidden">

          <div className="flex border-b">
            <button
              onClick={() => setImported(false)}
              className={`flex-1 px-4 py-3 text-sm font-semibold ${
                !imported ? "bg-blue-600 text-white" : ""
              }`}
            >
              📥 Importar datos GPS
            </button>

            <button
              onClick={() => setImported(true)}
              className={`flex-1 px-4 py-3 text-sm font-semibold ${
                imported ? "bg-blue-600 text-white" : ""
              }`}
            >
              📊 Ver datos GPS
            </button>
          </div>

          <div className="p-4 border-b">
            <p className="text-sm font-semibold">¿No conoces el formato requerido?</p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Descarga plantilla CSV con formato correcto.
              </p>
              <button
  onClick={downloadTemplate}
  className="bg-gray-900 text-white text-xs px-3 py-2 rounded"
>
  Descargar plantilla
</button>
            </div>
          </div>

        

         <div className="p-6 border-t text-sm text-gray-700 space-y-4">

  {/* ───── COLUMNAS ───── */}
  <div className="p-5 rounded-xl bg-blue-100/40 backdrop-blur-md border border-blue-200/30">
    <p className="font-bold text-blue-800 mb-3 text-base">
      Columnas requeridas
    </p>

    <ul className="space-y-1 text-gray-700">
      <li>• Placa</li>
      <li>• Estado</li>
      <li>• Proveedor</li>
      <li>• Fecha</li>
      <li>• Latitud</li>
      <li>• Longitud</li>
      <li>• Velocidad</li>
      <li>• Km</li>
    </ul>
  </div>

  {/* ───── VALIDACIONES ───── */}
  <div className="p-5 rounded-xl bg-purple-100/40 backdrop-blur-md border border-purple-200/30">
    <p className="font-bold text-purple-800 mb-3 text-base">
      Reglas de validación
    </p>

    <ul className="space-y-1 text-gray-700">
      <li>• Fecha en formato válido (YYYY-MM-DD)</li>
      <li>• Latitud numérica</li>
      <li>• Longitud numérica</li>
      <li>• Velocidad en km/h</li>
      <li>• Archivo CSV estructurado correctamente</li>
    </ul>
  </div>

</div>

        </div>


    

        {/* CARGA MASIVA */}
        <div className="bg-white border rounded-xl p-5 mt-6">
          <h2 className="font-bold mb-3">Carga Masiva GPS</h2>

          <select
            className="border p-2 rounded w-full mb-3"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="">Seleccionar proveedor</option>
            <option value="GPSControl.pe">GPSControl.pe</option>
            <option value="GlobalGPSPeru.com">GlobalGPSPeru.com</option>
          </select>

          <input type="file" onChange={handleFile} />

          <div className="flex gap-2 mt-3">
            <button
              disabled={!validated}
              onClick={handleImport}
              className={`px-4 py-2 rounded text-white ${
                validated ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              Importar Datos
            </button>
          </div>
        </div>

        {/* DATA VIEW */}
        {imported && (
          <div className="mt-6 bg-white border rounded-xl p-5">
            <h2 className="font-bold mb-3">Ver Datos GPS</h2>

            <div className="flex gap-3 mb-4">
              <input
                placeholder="Filtrar placa"
                className="border p-2 rounded"
                onChange={(e) => setFilterPlaca(e.target.value)}
              />

              <select
                className="border p-2 rounded"
                onChange={(e) => setFilterProveedor(e.target.value)}
              >
                <option value="">Todos proveedores</option>
                <option value="GPSControl.pe">GPSControl.pe</option>
                <option value="GlobalGPSPeru.com">GlobalGPSPeru.com</option>
              </select>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th>Placa</th>
                  <th>Estado</th>
                  <th>Proveedor</th>
                  <th>Fecha</th>
                  <th>Km</th>
                  <th>Velocidad</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((d, i) => (
                  <tr key={i} className="border-b">
                    <td>{d.placa}</td>
                    <td className={d.estado === "EXCESO VELOCIDAD" ? "text-red-500 font-bold" : ""}>
                      {d.estado}
                    </td>
                    <td>{d.proveedor}</td>
                    <td>{d.fecha}</td>
                    <td>{d.km}</td>
                    <td>{d.velocidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default GpsIntegrationPage;