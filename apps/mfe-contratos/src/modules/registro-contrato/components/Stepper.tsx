import { registroSteps } from '../constants';

/**
 * Indicador visual del progreso del registro.
 * Recibe el paso actual y pinta cada etapa como pendiente, activa o completada.
 */
export function Stepper({ step }: { step: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="grid gap-5 sm:grid-cols-3">
        {registroSteps.map((item, index) => {
          // Los pasos son 1-based porque asi se muestran al usuario.
          const number = index + 1;
          const active = step === number;
          const done = step > number;

          return (
            <div key={item.title} className="relative flex items-center gap-3 sm:justify-center">
              {index < registroSteps.length - 1 && (
                // Linea de conexion entre pasos, verde cuando la etapa anterior ya termino.
                <div
                  className={`absolute left-[64%] top-5 hidden h-px w-[72%] sm:block ${
                    step > number ? 'bg-emerald-500' : 'bg-blue-200'
                  }`}
                />
              )}

              <div
                className={`z-10 grid h-10 w-10 place-items-center rounded-full text-sm font-bold ${
                  done
                    ? 'bg-emerald-500 text-white'
                    : active
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'border border-slate-300 bg-white text-slate-500'
                }`}
              >
                {done ? 'OK' : number}
              </div>

              <div>
                <p
                  className={`text-[10px] font-bold uppercase ${
                    done ? 'text-emerald-700' : active ? 'text-blue-700' : 'text-slate-400'
                  }`}
                >
                  {item.subtitle}
                </p>
                <p
                  className={`text-xs font-bold ${
                    done ? 'text-emerald-700' : active ? 'text-blue-700' : 'text-slate-600'
                  }`}
                >
                  {item.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
