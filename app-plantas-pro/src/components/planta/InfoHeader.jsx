import { colores } from "../../constants/tema";

export const InfoHeader = ({
  nombrePrincipal = "Planta sin nombre",
  nombreCientifico = "",
}) => {
  return (
    <div style={styles.headerContainer}>
      {/* NOMBRE COMÚN: El protagonista */}
      <h1 style={styles.titulo}>
        {nombrePrincipal.charAt(0).toUpperCase() + nombrePrincipal.slice(1)}
      </h1>

      {/* NOMBRE CIENTÍFICO: Estilo botánico clásico */}
      {nombreCientifico && (
        <div style={styles.subtituloContainer}>
          <span style={styles.cientifico}>{nombreCientifico}</span>
        </div>
      )}

      {/* Una línea divisoria sutil para separar de las etiquetas/redes */}
      <hr style={styles.separador} />
    </div>
  );
};

const styles = {
  headerContainer: {
    marginBottom: "15px",
    padding: "0 5px",
  },
  titulo: {
    fontSize: "32px",
    fontWeight: "800",
    color: colores.bosque,
    margin: 0,
    lineHeight: "1.1",
    letterSpacing: "-0.5px",
  },
  subtituloContainer: {
    marginTop: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  cientifico: {
    fontSize: "18px",
    fontStyle: "italic",
    color: "#555",
    fontFamily: "serif", // Le da un toque de libro de botánica antiguo
  },
  separador: {
    border: "none",
    borderBottom: "1px solid #eee",
    marginTop: "20px",
    width: "40%", // No cruza toda la pantalla, solo un detalle
  },
};
