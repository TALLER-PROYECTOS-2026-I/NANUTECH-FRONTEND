import { useEffect, useState } from 'react';
import { turnoChoferService } from '../services/turnoChofer.service';
import { TurnoChofer } from '../types/turnoChofer.types';

const CONDUCTOR_ID = 1;

export const useTurnoChofer = () => {
  const [turno, setTurno] = useState<TurnoChofer | null>(null);

  const loadTurno = async () => {
    const data = await turnoChoferService.getCurrentShift(CONDUCTOR_ID);
    setTurno(data);
  };

  const iniciarTurno = async () => {
    const data = await turnoChoferService.startShift();
    setTurno(data);
  };

  const finalizarTurno = async () => {
    await turnoChoferService.endShift();
    loadTurno();
  };

  useEffect(() => {
    loadTurno();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    turno,
    iniciarTurno,
    finalizarTurno
  };
};


