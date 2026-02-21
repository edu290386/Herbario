// Para que el buscador de JS siempre encuentre coincidencias sin importar tildes
export const normalizarParaBusqueda = (texto) => {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quita acentos
    .trim();
};

// Para cuando TÚ guardas una planta nueva (La "limpieza de admin")
export const formatearParaDB = (texto) => {
  if (!texto) return "";
  const t = texto.trim().toLowerCase();
  // Pone la primera letra en mayúscula: "piñon" -> "Piñon"
  return t.charAt(0).toUpperCase() + t.slice(1);
};
