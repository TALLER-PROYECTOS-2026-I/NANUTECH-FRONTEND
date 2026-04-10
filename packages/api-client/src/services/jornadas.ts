const BASE_URL =
  "https://q26dwk17da.execute-api.us-east-1.amazonaws.com/Stage";

/**
 * Obtener unidades disponibles (ANTES: getJornadas)
 */
export const getJornadas = async () => {
  const res = await fetch(`${BASE_URL}/unidades/disponibles`);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error API:", errorText);
    throw new Error("Error al obtener unidades disponibles");
  }

  return await res.json();
};

/**
 * Crear jornada (si tu backend aún lo soporta)
 * OJO: si esta API no existe, esto dará error 404/500
 */
export const createJornada = async (data: any) => {
  const res = await fetch(`${BASE_URL}/jornadas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error API:", errorText);
    throw new Error("Error al crear jornada");
  }

  return await res.json();
};