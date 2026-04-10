const BASE_URL =
  "https://q26dwk17da.execute-api.us-east-1.amazonaws.com/Stage/unidades";

/* 🔵 OBTENER UNIDADES DISPONIBLES */
export const getCamiones = async () => {
  const res = await fetch(`${BASE_URL}/disponibles`);

  if (!res.ok) {
    throw new Error("Error al obtener unidades disponibles");
  }

  const data = await res.json();

  // 🔥 normalización (evita que tu dashboard se rompa)
  return data.data || data.unidades || data || [];
};

/* 🟢 OBTENER UNIDAD POR ID */
export const getCamionById = async (id: string) => {
  const res = await fetch(`${BASE_URL}/${id}`);

  if (!res.ok) {
    throw new Error("Error al obtener unidad por ID");
  }

  const data = await res.json();

  return data.data || data.unidad || data;
};