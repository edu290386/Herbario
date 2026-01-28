import { MdOutlineFiberNew } from "react-icons/md";

export const EtiquetaReciente = ({ fechaISO }) => {
  const calcularReciente = (fechaProp) => {
    if (!fechaProp) return false;

    // Intentamos convertir la prop en un objeto de fecha
    // Si fechaProp viene como '28/1/2026', este paso suele fallar
    const fechaCreacion = new Date(fechaProp);
    const ahora = new Date();

    // Verificamos si la fecha es válida antes de restar
    if (isNaN(fechaCreacion.getTime())) {
      console.error("Formato de fecha no reconocido:", fechaProp);
      return false;
    }

    const diferenciaMilisegundos = ahora - fechaCreacion;
    const veinticuatroHoras = 24 * 60 * 60 * 1000;

    return (
      diferenciaMilisegundos < veinticuatroHoras && diferenciaMilisegundos > 0
    );
  };

  // Aquí ejecutamos la función (con paréntesis) para obtener el booleano
  const mostrarEtiqueta = calcularReciente(fechaISO);

  if (!mostrarEtiqueta) return null;

  return (
    <div style={styles.contenedor}>
      <MdOutlineFiberNew
        size={32}
        className={"blink_me"}
      />
    </div>
  );
};

const styles = {
  contenedor: {
    display: "inline-flex",
    alignItems: "center",
    marginLeft: "4px",
    verticalAlign: "middle",
  },
}

