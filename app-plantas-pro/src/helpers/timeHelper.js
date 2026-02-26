export const formatearFechaLocal = (fechaISO) => {
  if (!fechaISO) return "00/00/0000";
  const fecha = new Date(fechaISO);
  if (isNaN(fecha.getTime())) return "00/00/0000";
  return fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
