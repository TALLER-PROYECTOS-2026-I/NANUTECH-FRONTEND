export type Jornada = {
  id: string;
  fecha: string;
  conductor: string;
  camion: string;
  contrato: string;
  horario: string;
  km: number;
  estado: string;
  observaciones?: string;
};

// 👉 INPUT PARA CREAR (SIN ID)
export type JornadaInput = Omit<Jornada, "id">;

// 🔥 DATA LOCAL (SIMULA BACKEND)
const jornadasMock: Jornada[] = [
  {
    id: "JRN-001",
    fecha: "2026-04-10",
    conductor: "Carlos Gomez",
    camion: "ABC-123",
    contrato: "CTR-001",
    horario: "08:00 - 16:00",
    km: 120,
    estado: "Activa",
    observaciones: "",
  },
  {
    id: "JRN-002",
    fecha: "2026-04-11",
    conductor: "Luis Martinez",
    camion: "XYZ-987",
    contrato: "CTR-002",
    horario: "09:00 - 17:00",
    km: 200,
    estado: "Completada",
    observaciones: "Sin incidencias",
  },
];

/**
 * GET JORNADAS (LOCAL)
 */
export const getJornadas = async (): Promise<Jornada[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...jornadasMock]);
    }, 300);
  });
};

/**
 * CREATE JORNADA (LOCAL)
 */
export const createJornada = async (
  data: JornadaInput
): Promise<Jornada> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const nueva: Jornada = {
        ...data,
        id: `JRN-${Math.floor(Math.random() * 9999)}`,
      };

      jornadasMock.unshift(nueva);

      resolve(nueva);
    }, 300);
  });
};