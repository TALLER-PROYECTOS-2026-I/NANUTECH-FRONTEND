import { useEffect, useState } from "react";
import { getJornadas } from "./services/jornadas.service";
import "./seguimiento.css";

type JornadaSeguimiento = {
  fecha: string;
  chofer: string;
  placa: string;
  horaInicio: string;
  horaFin?: string;
  estado: string;
  observaciones?: string;
};

export default function SeguimientoJornadas() {
  const [data, setData] = useState<JornadaSeguimiento[]>([]);
  const [search, setSearch] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [modal, setModal] = useState<JornadaSeguimiento | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getJornadas();
        setData((Array.isArray(res) ? res : res?.data ?? []) as JornadaSeguimiento[]);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getDuracion = (j: JornadaSeguimiento) => {
    if (!j.horaInicio || !j.horaFin) return "En curso";
    const inicio = new Date(`${j.fecha} ${j.horaInicio}`);
    const fin = new Date(`${j.fecha} ${j.horaFin}`);
    const diff = (fin.getTime() - inicio.getTime()) / 60000;
    return `${Math.floor(diff / 60)}h ${Math.floor(diff % 60)}m`;
  };

  const filtered = data.filter((j) => {
    const text = `${j.chofer} ${j.placa}`.toLowerCase();
    const fecha = new Date(j.fecha).getTime();
    const desdeOk = desde ? fecha >= new Date(desde).getTime() : true;
    const hastaOk = hasta ? fecha <= new Date(hasta).getTime() : true;

    return text.includes(search.toLowerCase()) && desdeOk && hastaOk;
  });

  // 🔥 EXPORT CSV
  const exportCSV = () => {
    const rows = [
      ["Fecha", "Chofer", "Placa", "Inicio", "Fin", "Duración", "Estado"]
    ];

    filtered.forEach((j) => {
      rows.push([
        j.fecha,
        j.chofer,
        j.placa,
        j.horaInicio,
        j.horaFin || "En curso",
        getDuracion(j),
        j.estado
      ]);
    });

    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "jornadas.csv";
    a.click();
  };

  return (
    <div className="page">

      {/* HEADER */}
      <div className="header">
        <div>
          <h2>Seguimiento de Jornadas</h2>
          <p>Monitorea el historial completo</p>
        </div>

        <div className="actions">
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Nueva Jornada
          </button>

          <button className="btn-success" onClick={exportCSV}>
            Exportar CSV
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="filtersCard">
        <div className="filtersHeader">Filtros de búsqueda</div>

        <div className="filters">
          <label>Búsqueda general</label>
          <label>Conductor</label>
          <label>Fecha desde</label>
          <label>Fecha hasta</label>

          <input
            placeholder="Buscar por conductor, placa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select>
            <option>Todos los conductores</option>
          </select>

          <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
      </div>

      {/* TABLA */}
      <div className="tableCard">
        <div className="title">Historial de Jornadas</div>

        {loading ? (
          <div className="empty">Cargando jornadas...</div>
        ) : (
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Chofer</th>
              <th>Placa</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Duración</th>
              <th>Estado</th>
              <th>Obs</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty">Sin datos</td>
              </tr>
            ) : (
              filtered.map((j, i) => (
                <tr key={i}>
                  <td>{j.fecha}</td>
                  <td>{j.chofer}</td>
                  <td>{j.placa}</td>
                  <td>{j.horaInicio}</td>

                  <td>
                    {j.horaFin || (
                      <span className="inProgress">Activa</span>
                    )}
                  </td>

                  <td>{getDuracion(j)}</td>

                  <td>
                    <span className={`status ${j.estado === "Activo" ? "en-curso" : "completado"}`}>
                      {j.estado}
                    </span>
                  </td>

                  <td>
                    {j.observaciones ? (
                      <button className="warn" onClick={() => setModal(j)}>
                        ⚠️
                      </button>
                    ) : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        )}
      </div>

      {/* MODAL OBSERVACIONES */}
      {modal && (
        <div className="modal">
          <div className="modalContent">
            <h3>Observaciones</h3>
            <p><b>Chofer:</b> {modal.chofer}</p>
            <p><b>Placa:</b> {modal.placa}</p>
            <p>{modal.observaciones}</p>
            <button onClick={() => setModal(null)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* 🔥 FORM NUEVA JORNADA */}
      {/* 🔥 FORM NUEVA JORNADA (PRO) */}
{showForm && (
  <div className="modal">
    <div className="modalContent large">

      {/* HEADER */}
      <div className="modalHeader">
        <h3>Registrar Nueva Jornada</h3>
        <span className="close" onClick={() => setShowForm(false)}>✖</span>
      </div>

      {/* ALERT */}
      <div className="alert">
        Los campos marcados con (*) son obligatorios
      </div>

      {/* =========================
         ASIGNACIÓN
      ========================= */}
      <h4 className="sectionTitle">Asignación de Recursos Operativos</h4>

      <div className="formGrid3">
        <div>
          <label>Conductor *</label>
          <select>
            <option>Seleccionar...</option>
          </select>
        </div>

        <div>
          <label>Unidad de Transporte *</label>
          <select>
            <option>Seleccionar...</option>
          </select>
        </div>

        <div>
          <label>Contrato Comercial *</label>
          <select>
            <option>Seleccionar...</option>
          </select>
        </div>
      </div>

      {/* =========================
         DETALLES
      ========================= */}
      <h4 className="sectionTitle">Detalles de la Jornada</h4>

      <div className="formGrid3">
        <div>
          <label>Fecha *</label>
          <input type="date" />
        </div>

        <div>
          <label>Hora de inicio *</label>
          <input type="time" />
        </div>

        <div>
          <label>Hora de fin</label>
          <input type="time" />
        </div>
      </div>

      <div className="formGrid3">
        <div>
          <label>Kilómetros recorridos</label>
          <input placeholder="0.00" />
        </div>

        <div>
          <label>Origen</label>
          <input placeholder="Ciudad o ubicación" />
        </div>

        <div>
          <label>Destino</label>
          <input placeholder="Ciudad o ubicación" />
        </div>
      </div>

      {/* OBSERVACIONES */}
      <div className="formFull">
        <label>Observaciones</label>
        <textarea placeholder="Ingrese observaciones..." />
      </div>

      {/* ALERTA FINAL */}
      <div className="alert warning">
        Complete todos los campos obligatorios (*) para continuar
      </div>

      {/* BOTONES */}
      <div className="formActions">
        <button onClick={() => setShowForm(false)}>
          Cancelar
        </button>

        <button
          className="btn-primary"
          onClick={() => {
            // 🔥 SIMULACIÓN DE REGISTRO
            setShowForm(false);
            alert("Jornada registrada correctamente");
          }}
        >
          Registrar Jornada
        </button>
      </div>

    </div>
  </div>
)}

    </div>
  );
}
