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
          <span style={{ margin: "0 5px", fontWeight: "bold", color: colores.bosque }}>
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

// --- ESTILOS AL FINAL PARA MAYOR CLARIDAD ---
const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    padding: "1.2rem 0",
    width: "100%",
  },
  container: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  button: (disabled) => ({
    background: "transparent",
    border: "none",
    color: disabled ? "#ccc" : "var(--color-frondoso)",
    padding: "0.7rem 1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "1.1rem",
    transition: "background 0.2s",
    outline: "none",
  }),
  indicator: {
    padding: "0 1rem",
    fontWeight: "700",
    fontSize: "0.95rem",
    color: "var(--color-carbon)",
    borderLeft: "1px solid #eee",
    borderRight: "1px solid #eee",
    height: "40px",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    userSelect: "none",
  },
};
