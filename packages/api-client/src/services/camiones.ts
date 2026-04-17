const BASE_URL =
  "https://q26dwk17da.execute-api.us-east-1.amazonaws.com/Stage";

export const getCamiones = async () => {
  const res = await fetch(`${BASE_URL}/unidades/disponibles`);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error API unidades:", errorText);
    throw new Error("Error al obtener camiones");
  }

  const json = await res.json();
  return json.data;
};