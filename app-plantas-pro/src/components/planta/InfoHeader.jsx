export const InfoHeader = ({
  nombrePrincipal = "Planta sin nombre",
  nombreCientifico = "",
}) => {
  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>
        {nombrePrincipal.charAt(0).toUpperCase() + nombrePrincipal.slice(1)}
      </h1>

      {nombreCientifico && (
        <div style={styles.cientificoWrapper}>
          <span style={styles.linea} />
          <i style={styles.cientificoTexto}>{nombreCientifico}</i>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { marginBottom: "25px", paddingLeft: "4px" },
  tagSuperior: {
    display: "inline-block",
    backgroundColor: "rgba(76, 175, 80, 0.1)", // Mismo verde del carrusel active
    color: "#4CAF50",
    fontSize: "9px",
    fontWeight: "900",
    padding: "3px 10px",
    borderRadius: "100px",
    letterSpacing: "1px",
    marginBottom: "8px",
  },
  titulo: {
    fontSize: "32px",
    fontWeight: "900",
    color: "#222",
    margin: 0,
    lineHeight: "1",
    letterSpacing: "-0.5px",
  },
  cientificoWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },
  linea: {
    width: "20px",
    height: "2px",
    backgroundColor: "#4CAF50",
    borderRadius: "2px",
  },
  cientificoTexto: { fontSize: "15px", color: "#666", fontWeight: "500" },
};
