export const obtenerIdentidad = (usuario) => {
  if (!usuario) return "Cargando...";

  // 1. Prioridad: Alias
  if (usuario.alias && usuario.alias.trim() !== "") {
    return usuario.alias;
  }

  // 2. Prioridad: jtorres (Primera letra nombre + primer apellido)
  if (usuario.nombre && usuario.apellido) {
    const primeraLetra = usuario.nombre.trim().charAt(0).toLowerCase();
    // Tomamos solo el primer apellido por si puso dos
    const primerApellido = usuario.apellido.trim().split(" ")[0].toLowerCase();
    return `${primeraLetra}${primerApellido}`;
  }

  // 3. Fallback: Solo nombre o genérico
  return usuario.nombre || "Usuario";
};
