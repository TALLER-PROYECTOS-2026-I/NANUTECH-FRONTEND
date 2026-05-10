// Devuelve la fecha actual en formato YYYY-MM-DD para input type="date".
// Se arma con getters locales para no depender de toISOString, que puede mover el dia por zona horaria.
export const getTodayLocal = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
