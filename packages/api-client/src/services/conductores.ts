const BASE_URL =
  "https://q26dwk17da.execute-api.us-east-1.amazonaws.com/Stage";

export const getConductores = async () => {
  const res = await fetch(`${BASE_URL}/conductores`);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error API conductores:", errorText);
    throw new Error("Error al obtener conductores");
  }

  const json = await res.json();

  // tu API devuelve { success, message, data }
  return json.data;
};