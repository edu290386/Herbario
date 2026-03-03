import { TbCloverFilled } from "react-icons/tb";
import { FaRegCopyright } from "react-icons/fa";
import { colores } from "../../constants/tema";
import { appConfig } from "../../constants/appConfig"; // 👈 1. Importas tu configuración

export const Spinner = ({ mensaje = "" }) => {
  const year = new Date().getFullYear();

  return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingContent}>
        {/* El trébol gigante que gira */}
        <TbCloverFilled style={styles.spinner} />

        <div style={styles.copyrightContainer}>
          {/* 👈 2. Usas el nombre de la empresa centralizado */}
          <p style={styles.empresaText}>{appConfig.empresa}</p>

          <p style={styles.derechosText}>
            <FaRegCopyright color={colores.bosque} /> {year} • Todos los
            derechos reservados
          </p>

          {/* 👈 3. Agregas la versión para que haga juego con el Footer */}
          <p style={styles.versionText}>
            {appConfig.nombreApp} {appConfig.version}
          </p>

          {/* Opcional: un pequeño texto dinámico debajo */}
          <p style={styles.mensaje}>{mensaje}</p>
        </div>
      </div>
    </div>
  );
};

// Inyectamos la animación una sola vez
if (typeof document !== "undefined") {
  const styleId = "spinner-animation";
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement("style");
    styleSheet.id = styleId;
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes spin {
        0% { transform: rotate(0deg); opacity: 0.7; scale: 0.95; }
        50% { transform: rotate(180deg); opacity: 1; scale: 1.05; }
        100% { transform: rotate(360deg); opacity: 0.7; scale: 0.95; }
      }
    `;
    document.head.appendChild(styleSheet);
  }
}

const styles = {
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
    backgroundColor: "#F3F4F6", // o colores.fondo
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 9999,
  },
  loadingContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "30px",
  },
  spinner: {
    fontSize: "8rem",
    animation: "spin 2.5s linear infinite",
    filter: "drop-shadow(0 0 15px rgba(45, 106, 79, 0.2))",
    color: colores.frondoso,
  },
  copyrightContainer: {
    textAlign: "center",
  },
  empresaText: {
    fontSize: "18px",
    fontWeight: "bold",
    color: colores.bosque,
    margin: "0 0 5px 0",
    letterSpacing: "0.5px",
  },
  derechosText: {
    fontSize: "12px",
    color: "#6B7280",
    margin: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
  },
  versionText: {
    // 👈 Estilo nuevo para la versión
    fontSize: "11px",
    color: "#9CA3AF",
    margin: "3px 0 0 0",
    fontWeight: "600",
  },
  mensaje: {
    fontSize: "13px",
    color: colores.frondoso,
    marginTop: "15px",
    fontWeight: "500",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
};
