export const resaltarTexto = (texto, busqueda) => {
  if (!texto) return "";
  if (!busqueda || busqueda.trim().length < 2) return texto;

  // 1. Función para quitar acentos solo para la comparación
  const normalizar = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const textoNorm = normalizar(texto);
  const busquedaNorm = normalizar(busqueda);

  // 2. Si no hay coincidencia, devolvemos el texto tal cual
  if (!textoNorm.includes(busquedaNorm)) return texto;

  // 3. Dividimos el texto usando la coincidencia normalizada
  const parts = [];
  let lastIndex = 0;
  let findIndex = textoNorm.indexOf(busquedaNorm);

  while (findIndex !== -1) {
    // Texto antes de la coincidencia
    parts.push(texto.substring(lastIndex, findIndex));

    // El trozo real del texto original (con sus acentos originales)
    const originalChunk = texto.substring(
      findIndex,
      findIndex + busquedaNorm.length,
    );

    parts.push(
      <mark
        key={findIndex}
        style={{
          backgroundColor: "#fff34d",
          color: "#000",
          fontWeight: "bold",
          padding: "0 2px",
          borderRadius: "2px",
        }}
        className="resaltado-amarillo"
      >
        {originalChunk}
      </mark>,
    );

    lastIndex = findIndex + busquedaNorm.length;
    findIndex = textoNorm.indexOf(busquedaNorm, lastIndex);
  }

  // Resto del texto después de la última coincidencia
  parts.push(texto.substring(lastIndex));

  return parts;
};
