interface MfeLoaderProps {
  modulo: string;
}

export default function MfeLoader({ modulo }: MfeLoaderProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Logo animado con halo */}
      <div className="relative mb-8 flex items-center justify-center">
        {/* Anillo giratorio exterior */}
        <span className="absolute h-24 w-24 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
        {/* Halo pulsante */}
        <span className="absolute h-24 w-24 rounded-full bg-blue-500/10 animate-ping" />

        {/* Logo de la marca */}
        <div className="relative w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-9 h-9 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <path d="M16 8h4l3 5v4h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
      </div>

      {/* Texto */}
      <h2 className="text-lg font-bold text-slate-800 tracking-wide">NANU TECH</h2>
      <p className="mt-1 text-sm text-slate-500">
        Cargando módulo de{' '}
        <span className="font-semibold text-blue-600">{modulo}</span>
      </p>

      {/* Puntos animados */}
      <div className="mt-5 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" />
      </div>
    </div>
  );
}
