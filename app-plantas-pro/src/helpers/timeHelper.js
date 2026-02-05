export const formatearFechaLocal = (fechaISO) => {
  if (!fechaISO) return "Fecha no disponible";

  return new Date(fechaISO)
    .toLocaleString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      
    })
    ;
};
