import {
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
} from "react-icons/fa";
import { colores } from "../../constants/tema";

export const Paginador = ({ paginaActual, totalPaginas, alCambiarPagina }) => {
  if (totalPaginas <= 1) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* IR AL INICIO */}
        <button
          disabled={paginaActual === 1}
          onClick={() => alCambiarPagina(1)}
          style={styles.button(paginaActual === 1)}
        >
          <FaAngleDoubleLeft />
        </button>

        {/* ANTERIOR */}
        <button
          disabled={paginaActual === 1}
          onClick={() => alCambiarPagina(paginaActual - 1)}
          style={styles.button(paginaActual === 1)}
        >
          <FaAngleLeft />
        </button>

        {/* INDICADOR */}
        <div style={styles.indicator}>
          {paginaActual}{" "}
          <span
            style={{
              margin: "0 5px",
              fontWeight: "bold",
              color: colores.bosque,
            }}
          >
            de
          </span>{" "}
          {totalPaginas}
        </div>

        {/* SIGUIENTE */}
        <button
          disabled={paginaActual === totalPaginas}
          onClick={() => alCambiarPagina(paginaActual + 1)}
          style={styles.button(paginaActual === totalPaginas)}
        >
          <FaAngleRight />
        </button>

        {/* IR AL FINAL */}
        <button
          disabled={paginaActual === totalPaginas}
          onClick={() => alCambiarPagina(totalPaginas)}
          style={styles.button(paginaActual === totalPaginas)}
        >
          <FaAngleDoubleRight />
        </button>
      </div>
    </div>
  );
};

// --- ESTILOS AJUSTADOS PARA SIMETRÍA ---
const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    // Eliminamos el padding vertical para que el gap del HomePage controle la distancia
    padding: "0.2rem 0",
  },
  container: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: "15px", // Ajustado a 15px para igualar Top Bar y Buscador
    overflow: "hidden",
    // Agregamos el mismo borde sutil que tienen los otros componentes
    border: "1px solid rgba(0, 0, 0, 0.05)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
  },
  button: (disabled) => ({
    background: "transparent",
    border: "none",
    color: disabled ? "#ccc" : "var(--color-frondoso)",
    padding: "0.8rem 1.1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "1.1rem",
    transition: "background 0.2s",
    outline: "none",
  }),
  indicator: {
    padding: "0 1.2rem",
    fontWeight: "700",
    fontSize: "0.95rem",
    color: "var(--color-carbon)",
    borderLeft: "1px solid #f0f0f0",
    borderRight: "1px solid #f0f0f0",
    height: "46px", // Aumentado ligeramente para que tenga cuerpo frente a las cards
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fafafa",
    userSelect: "none",
  },
};
