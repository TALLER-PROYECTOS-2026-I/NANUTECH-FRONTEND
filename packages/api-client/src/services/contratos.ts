const BASE_URL =
  "https://q26dwk17da.execute-api.us-east-1.amazonaws.com/Stage";

export const getContratosVigentes = async () => {
  const res = await fetch(`${BASE_URL}/contratos/vigentes`);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error API contratos:", errorText);
    throw new Error("Error al obtener contratos");
  }

  const json = await res.json();
  return json.data;
};