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


export const cleanNumeric = (value) => {
  if (!value) return "";
  // El Regex \D busca cualquier caracter que NO sea un dígito y lo elimina
  return value.replace(/\D/g, "");
};

/**
 * Valida si un teléfono tiene una longitud mínima razonable
 */
export const isValidPhone = (phone) => {
  const clean = cleanNumeric(phone);
  return clean.length >= 8 && clean.length <= 15;
};