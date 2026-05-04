import { useMemo, useState } from "react";
import DashboardLayout from "../../../layouts/DashboardLayout";
import "../../dashboard-admin/pages/Dashboard.css";

const REQUIRED_COLUMNS = [
  "fecha",
  "hora",
  "placa",
  "latitud",
  "longitud",
  "velocidad",
  "rumbo",
  "distancia_total",
];

type GpsRow = {
  fecha: string;
  hora: string;
  placa: string;
  latitud: number;
  longitud: number;
  velocidad: number;
  rumbo: number;
  distancia_total: number;
  proveedor: string;
};

const mockDb = new Set<string>();

const normalize = (v: unknown): string => (v ? String(v).trim() : "");

function GpsIntegrationPage() {
  const [provider, setProvider] = useState<string>("");
  const [, setFile] = useState<File | null>(null);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [imported, setImported] = useState<GpsRow[]>([]);
  const [filterProvider, setFilterProvider] = useState<string>("all");
  const [filterPlate, setFilterPlate] = useState<string>("");

  const kpis = useMemo(() => {
    const total = imported.length;
    const moving = imported.filter((i) => i.velocidad > 0).length;
    const stopped = total - moving;
    const avgSpeed = total
      ? (imported.reduce((a, b) => a + b.velocidad, 0) / total).toFixed(1)
      : 0;

    return { total, moving, stopped, avgSpeed };
  }, [imported]);

  const validateFile = () => {
    const errs: string[] = [];

    if (REQUIRED_COLUMNS.length !== 8) {
      errs.push("Estructura inválida");
    }

    setErrors(errs);
    setIsValid(errs.length === 0);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    validateFile();
  };

  const importData = () => {
    if (!isValid) return;

    const rows: GpsRow[] = [
      {
        fecha: "2026-05-04",
        hora: "10:00",
        placa: "ABC123",
        latitud: -12.04,
        longitud: -77.03,
        velocidad: 60,
        rumbo: 120,
        distancia_total: 10,
        proveedor: provider,
      },
      {
        fecha: "2026-05-04",
        hora: "10:00",
        placa: "ABC123",
        latitud: -12.04,
        longitud: -77.03,
        velocidad: 60,
        rumbo: 120,
        distancia_total: 10,
        proveedor: provider,
      },
    ];

    const clean: GpsRow[] = [];

    rows.forEach((r) => {
      const key = `${r.placa}-${r.fecha}-${r.hora}`;

      if (!mockDb.has(key)) {
        mockDb.add(key);
        clean.push(r);
      }
    });

    setImported((prev) => [...prev, ...clean]);
  };

  const downloadTemplate = () => {
    const blob = new Blob([REQUIRED_COLUMNS.join(",")], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gps_template_${provider || "nanutech"}.csv`;
    a.click();
  };

  const filteredData = imported.filter(
    (d) =>
      (filterProvider === "all" ||
        normalize(d.proveedor) === normalize(filterProvider)) &&
      (!filterPlate || d.placa.includes(filterPlate))
  );

  return (
    <DashboardLayout>
      <div className="gps-header">
        <h1>Integración GPS</h1>
        <p>Sistema de monitoreo de flota Nanutech</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi purple"><span>Total</span><h2>{kpis.total}</h2></div>
        <div className="kpi blue"><span>Movimiento</span><h2>{kpis.moving}</h2></div>
        <div className="kpi purple"><span>Detenidos</span><h2>{kpis.stopped}</h2></div>
        <div className="kpi blue"><span>Vel Prom</span><h2>{kpis.avgSpeed} km/h</h2></div>
      </div>

      <div className="panel">
        <h3>Carga Masiva GPS</h3>

        <select className="input" onChange={(e) => setProvider(normalize(e.target.value))}>
          <option value="">Seleccionar proveedor</option>
          <option value="GPSControl.pe">GPSControl.pe</option>
          <option value="GlobalGPSPeru.com">GlobalGPSPeru.com</option>
        </select>

        <button disabled={!provider} onClick={downloadTemplate} className="btn blue">
          Descargar Plantilla
        </button>

        <input type="file" className="input" onChange={handleFile} />

        {errors.length > 0 && (
          <div className="error">
            {errors.map((e, i) => (
              <p key={i}>{e}</p>
            ))}
          </div>
        )}

        <button
          className={`btn ${isValid ? "purple" : "disabled"}`}
          disabled={!isValid}
          onClick={importData}
        >
          Importar Datos
        </button>
      </div>

      <div className="panel">
        <h3>Datos GPS</h3>

        <div className="filters">
          <select onChange={(e) => setFilterProvider(e.target.value)}>
            <option value="all">Todos</option>
            <option value="GPSControl.pe">GPSControl.pe</option>
            <option value="GlobalGPSPeru.com">GlobalGPSPeru.com</option>
          </select>

          <input
            placeholder="Buscar placa"
            onChange={(e) => setFilterPlate(e.target.value)}
          />
        </div>

        <div className="grid">
          {filteredData.map((d, i) => (
            <div key={i} className={`card ${d.velocidad > 80 ? "danger" : ""}`}>
              <h4>{d.placa}</h4>
              <p>{d.proveedor}</p>
              <p>{d.fecha} {d.hora}</p>
              <p>{d.latitud}, {d.longitud}</p>
              <p>{d.velocidad} km/h</p>

              <span className={`badge ${d.velocidad > 80 ? "red" : "green"}`}>
                {d.velocidad > 80 ? "Exceso Velocidad" : "Normal"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 👇 CSS CORRECTAMENTE UBICADO */}
      <style>{`
        body{
          background:#f5f7fb;
          color:#111827;
        }

        .gps-header{margin-bottom:20px;}
        .gps-header p{color:#6b7280;}

        .kpi-grid{
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:16px;
          margin-bottom:20px;
        }

        .kpi{
          background:#ffffff;
          border-radius:14px;
          padding:16px;
          box-shadow:0 4px 10px rgba(0,0,0,0.05);
        }

        .kpi h2{margin:5px 0;color:#111827}
        .kpi span{color:#6b7280;font-size:12px}

        .purple{border-left:4px solid #7c3aed}
        .blue{border-left:4px solid #2563eb}

        .panel{
          background:#ffffff;
          border-radius:14px;
          padding:16px;
          margin-bottom:20px;
          box-shadow:0 4px 10px rgba(0,0,0,0.05);
        }

        .input{
          width:100%;
          padding:10px;
          border-radius:10px;
          border:1px solid #e5e7eb;
          margin-top:10px;
        }

        .btn{
          padding:10px 14px;
          border-radius:10px;
          border:none;
          cursor:pointer;
          margin-top:10px;
        }

        .disabled{background:#e5e7eb;color:#9ca3af;cursor:not-allowed}

        .error{
          background:#fee2e2;
          color:#991b1b;
          padding:10px;
          border-radius:10px;
          margin-top:10px;
        }

        .filters{
          display:flex;
          gap:10px;
          margin-top:10px;
        }

        .grid{
          display:grid;
          grid-template-columns:repeat(3,1fr);
          gap:12px;
          margin-top:15px;
        }

        .card{
          background:#ffffff;
          border:1px solid #e5e7eb;
          padding:12px;
          border-radius:12px;
        }

        .card.danger{
          border:1px solid #ef4444;
        }

        .badge{
          display:inline-block;
          margin-top:8px;
          padding:4px 8px;
          border-radius:8px;
          font-size:12px;
        }

        .red{background:#ef4444;color:white}
        .green{background:#22c55e;color:white}
      `}</style>

    </DashboardLayout>
  );
}

export default GpsIntegrationPage;