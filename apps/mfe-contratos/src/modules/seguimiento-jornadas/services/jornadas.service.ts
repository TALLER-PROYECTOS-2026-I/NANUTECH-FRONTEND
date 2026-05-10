const BASE_URL = import.meta.env.VITE_API_URL;

export const getJornadas = async () => {
  const res = await fetch(`${BASE_URL}/jornadas`);

  if (!res.ok) throw new Error("Error API jornadas");

  const data = await res.json();

  // 👇 ASEGURAR QUE DEVUELVA ARRAY
  return Array.isArray(data) ? data : data.data ?? data.items ?? [];
};