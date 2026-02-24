export const obtenerIdentidad = (usuario) => {
  if (!usuario) return "Usuario";

  // 1. Prioridad: Si tú como administrador ya editaste un alias manual en la DB, lo respetamos.
  if (usuario.alias && usuario.alias.trim() !== "") {
    return usuario.alias;
  }

  // 2. Generación automática: "jtorres51"
  if (usuario.nombre && usuario.apellido && usuario.telefono) {
    const nombreLimpio = usuario.nombre.trim().toLowerCase();
    const apellidoLimpio = usuario.apellido.trim().split(" ")[0].toLowerCase();

    // Extraemos los últimos 2 dígitos del teléfono (asegurando que sea string)
    const telString = usuario.telefono.toString().replace(/\D/g, ""); // Solo números
    const ultimosDos = telString.slice(-2);

    const primeraLetra = nombreLimpio.charAt(0);

    return `${primeraLetra}${apellidoLimpio}${ultimosDos}`;
  }

  // 3. Fallback en caso de que falten datos durante la carga
  return usuario.nombre || "Usuario";
};
