import { useEffect, useState } from 'react';
import { turnoChoferService } from '../services/turnoChofer.service';
import { TurnoChofer } from '../types/turnoChofer.types';

export const useTurnoChofer = () => {
  const [turno, setTurno] = useState<TurnoChofer | null>(null);

  const loadTurno = async () => {
    const response = await turnoChoferService.obtenerTurnoActual();
    if (response.success && response.data) {
      setTurno(response.data);
    } else {
      setTurno(null);
    }
  };

  const iniciarTurno = async () => {
    const response = await turnoChoferService.iniciarTurno();
    if (response.success && response.data) {
      setTurno(response.data);
    }
  };

  const finalizarTurno = async (observaciones?: string) => {
    if (turno?.id) {
      await turnoChoferService.finalizarTurno({
        idTurno: turno.id,
        observaciones,
      });
      loadTurno();
    }
  };

  useEffect(() => {
    let isMounted = true;

    const cargarTurnoInicial = async () => {
      const response = await turnoChoferService.obtenerTurnoActual();
      if (isMounted && response.success && response.data) {
        setTurno(response.data);
      } else if (isMounted) {
        setTurno(null);
      }
    };

    cargarTurnoInicial();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    turno,
    iniciarTurno,
    finalizarTurno
  };
};
