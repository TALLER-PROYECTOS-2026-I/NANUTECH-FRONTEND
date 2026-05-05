import { useEffect, useState } from 'react';
import { getContratosVigentes, type Contrato } from '@nanutech/api-client';

type Props = {
  onNuevoContrato: () => void;
};

export default function ContratosPage({ onNuevoContrato }: Props) {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContratosVigentes()
      .then(setContratos)
      .catch(() => setContratos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f6f8] p-8">
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Contratos</h1>
            <p className="text-slate-500">Panel de gestión de contratos comerciales</p>
          </div>

          <button
            onClick={onNuevoContrato}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            + Nuevo Contrato
          </button>
        </div>

        {loading ? (
          <p>Cargando contratos...</p>
        ) : contratos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
            <h2 className="text-xl font-bold">No hay contratos registrados</h2>
            <p className="mt-2 text-slate-500">
              Registra un nuevo contrato comercial para iniciar.
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="p-3">Código</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">RUC</th>
                <th className="p-3">Ruta</th>
                <th className="p-3">Tarifa Total</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-3 font-mono">{c.codigo || c.id}</td>
                  <td className="p-3">{c.cliente}</td>
                  <td className="p-3">{c.ruc}</td>
                  <td className="p-3">{c.origen} → {c.destino}</td>
                  <td className="p-3 font-semibold">
                    S/ {Number(c.tarifa || c.distancia_estimada_km * c.tarifa_por_km || 0).toFixed(2)}
                  </td>
                  <td className="p-3">{c.estado || 'VIGENTE'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}