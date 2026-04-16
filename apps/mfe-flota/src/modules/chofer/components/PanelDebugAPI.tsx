import React, { useState } from 'react';
import { getJornadaActual, getJornadas } from '@nanutech/api-client';
import '../styles/PanelDebugAPI.css';

interface DebugLog {
  timestamp: string;
  tipo: 'info' | 'success' | 'error';
  mensaje: string;
  datos?: Record<string, unknown> | unknown[];
}

export const PanelDebugAPI: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [conductorId, setConductorId] = useState('CONDUCTOR-001');
  const [cargando, setCargando] = useState(false);

  const agregarLog = (
    tipo: 'info' | 'success' | 'error',
    mensaje: string,
    datos?: Record<string, unknown> | unknown[]
  ) => {
    const log: DebugLog = {
      timestamp: new Date().toLocaleTimeString('es-MX'),
      tipo,
      mensaje,
      datos,
    };
    setLogs((prevLogs) => [log, ...prevLogs]);
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`, datos);
  };

  const pruebaObtenerJornadas = async () => {
    setCargando(true);
    agregarLog('info', '🔄 Obteniendo todas las jornadas...');

    try {
      const resultado = await getJornadas();
      if (resultado && Array.isArray(resultado)) {
        agregarLog(
          'success',
          `✅ Jornadas obtenidas: ${resultado.length}`,
          resultado
        );
      } else {
        agregarLog('error', '❌ Respuesta inválida de getJornadas', resultado);
      }
    } catch (error) {
      agregarLog('error', '❌ Error obteniendo jornadas', { error: String(error) });
    } finally {
      setCargando(false);
    }
  };

  const pruebaObtenerJornadaActual = async () => {
    setCargando(true);
    agregarLog('info', `🔄 Obteniendo jornada actual para: ${conductorId}`);

    try {
      const resultado = await getJornadaActual(conductorId);
      if (resultado) {
        agregarLog('success', '✅ Jornada actual obtenida', resultado);
      } else {
        agregarLog(
          'info',
          '⚠️ No hay jornada activa para este conductor',
          { conductorId }
        );
      }
    } catch (error) {
      agregarLog('error', '❌ Error obteniendo jornada actual', { error: String(error) });
    } finally {
      setCargando(false);
    }
  };

  const limpiarLogs = () => {
    setLogs([]);
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        className="debug-boton-flotante"
        onClick={() => setVisible(!visible)}
        title="Panel de Debug de APIs"
      >
        🔧 DEBUG
      </button>

      {/* Panel */}
      {visible && (
        <div className="panel-debug-api">
          {/* Header */}
          <div className="debug-header">
            <h3>🔍 Panel de Debug - APIs</h3>
            <button
              className="debug-cerrar"
              onClick={() => setVisible(false)}
            >
              ✕
            </button>
          </div>

          {/* Controles */}
          <div className="debug-controles">
            <div className="debug-grupo">
              <label>CONDUCTOR_ID:</label>
              <input
                type="text"
                value={conductorId}
                onChange={(e) => setConductorId(e.target.value)}
                placeholder="ej: CONDUCTOR-001"
              />
            </div>

            <div className="debug-botones">
              <button
                onClick={pruebaObtenerJornadas}
                disabled={cargando}
                className="debug-btn debug-btn-info"
              >
                📋 Todas las Jornadas
              </button>
              <button
                onClick={pruebaObtenerJornadaActual}
                disabled={cargando}
                className="debug-btn debug-btn-info"
              >
                🚀 Jornada Actual
              </button>
              <button
                onClick={limpiarLogs}
                className="debug-btn debug-btn-clear"
              >
                🗑️ Limpiar Logs
              </button>
            </div>
          </div>

          {/* Logs */}
          <div className="debug-logs">
            <div className="debug-logs-header">
              <span>Logs ({logs.length})</span>
            </div>
            <div className="debug-logs-contenedor">
              {logs.length === 0 ? (
                <div className="debug-log-vacio">
                  Ejecuta una prueba para ver los resultados
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className={`debug-log debug-log-${log.tipo}`}>
                    <div className="debug-log-header">
                      <span className="debug-log-time">{log.timestamp}</span>
                      <span className="debug-log-tipo">{log.tipo}</span>
                    </div>
                    <div className="debug-log-mensaje">{log.mensaje}</div>
                    {log.datos && (
                      <details className="debug-log-datos">
                        <summary>📊 Datos</summary>
                        <pre>{JSON.stringify(log.datos, null, 2)}</pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Información */}
          <div className="debug-info">
            <p>
              <strong>URL Base:</strong>
              <br />
              https://q26dwk17da.execute-api.us-east-1.amazonaws.com/Stage
            </p>
            <p>
              <strong>Endpoints:</strong>
              <br />
              GET /jornadas
              <br />
              GET /jornadas/actual/{'{'}{conductorId}{'}'}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
