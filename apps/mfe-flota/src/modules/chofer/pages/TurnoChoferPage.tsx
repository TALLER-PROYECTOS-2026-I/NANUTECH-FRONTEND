import { useTurnoChofer } from '../hooks/useTurnoChofer';

export const TurnoChoferPage = () => {
  const { turno, iniciarTurno, finalizarTurno } = useTurnoChofer();

  if (!turno) {
    return <p>No tienes jornadas asignadas</p>;
  }

  return (
    <div>
      <h2>Estado del turno: {turno.state}</h2>
      <p>
        Ruta: {turno.origin} - {turno.destination}
      </p>

      {turno.state === 'PENDIENTE' && (
        <button onClick={iniciarTurno}>
          Iniciar Turno
        </button>
      )}

      {turno.state === 'EN_PROGRESO' && (
        <>
          <p>Turno en progreso...</p>
          <button onClick={finalizarTurno}>
            Finalizar Turno
          </button>
        </>
      )}
    </div>
  );
};