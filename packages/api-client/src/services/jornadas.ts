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

// 👉 PARA CREAR (sin id)
export type JornadaInput = Omit<Jornada, "id">;

type GetJornadasResponse = {
  success: boolean;
  message: string;
  data: Jornada[];
};

const API_URL =
  "https://q26dwk17da.execute-api.us-east-1.amazonaws.com/Stage/jornadas";

/**
 * GET JORNADAS (API REAL + FALLBACK LOCAL)
 */
export const getJornadas = async (): Promise<Jornada[]> => {
  try {
    const res = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Error en API");
    }

    const json: GetJornadasResponse = await res.json();

    // 👉 Guardamos en localStorage como respaldo
    localStorage.setItem("jornadas", JSON.stringify(json.data));

    return json.data;
  } catch (error) {
    console.warn("API no disponible, usando localStorage");

    const local = localStorage.getItem("jornadas");

    return local ? JSON.parse(local) : [];
  }
};

/**
 * CREATE JORNADA (LOCAL POR AHORA)
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

      // 👉 guardamos en localStorage
      const actuales = JSON.parse(
        localStorage.getItem("jornadas") || "[]"
      );

      const nuevas = [nueva, ...actuales];

      localStorage.setItem("jornadas", JSON.stringify(nuevas));

      resolve(nueva);
    }, 300);
  });
};