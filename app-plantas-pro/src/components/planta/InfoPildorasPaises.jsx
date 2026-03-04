import { obtenerBandera } from "../../constants/paisesConfig";
import { colores } from "../../constants/tema"

export const InfoPildorasPaises = ({ datosNombresInternacionales = [] }) => {
  if (!datosNombresInternacionales || datosNombresInternacionales.length === 0)
    return null;

  return (
    <div style={styles.contenedorPrincipal}>
      <h4 style={styles.miniTitulo}>Nombres por región</h4>
      <div style={styles.flowContainer}>
        {datosNombresInternacionales.map((bloque, i) => (
          <div key={i} style={styles.grupoPais}>
            <span style={styles.bandera}>{obtenerBandera(bloque.pais)}</span>
            <span style={styles.codigo}>{bloque.pais}:</span>
            <span style={styles.nombres}>
              {bloque.nombres.map((n) => n.texto).join(", ")}
            </span>
            {i < datosNombresInternacionales.length - 1 && (
              <span style={styles.divisor}>|</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  contenedorPrincipal: {
    margin: "10px 0",
    padding: "0 2px",
  },
  miniTitulo: {
    fontSize: "10px",
    color: "#aaa",
    textTransform: "uppercase",
    fontWeight: "700",
    marginBottom: "5px",
    letterSpacing: "0.5px",
  },
  flowContainer: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: "8px",
    rowGap: "4px", // Por si hay muchos y saltan de línea
  },
  grupoPais: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  bandera: {
    fontSize: "14px",
  },
  codigo: {
    fontSize: "11px",
    fontWeight: "800",
    color: colores.bosque,
    opacity: 0.8,
  },
  nombres: {
    fontSize: "13px",
    color: "#444",
    fontWeight: "500",
  },
  divisor: {
    color: "#ddd",
    marginLeft: "4px",
    fontWeight: "300",
  },
};
