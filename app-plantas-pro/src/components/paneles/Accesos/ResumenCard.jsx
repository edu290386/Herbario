import {
  FaPhoneAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaEraser,
  FaMicrochip,
  FaLayerGroup,
  FaUserLock,
} from "react-icons/fa";
import { BsCalendar2Check } from "react-icons/bs";

export const ResumenCard = ({ data, onLimpiar }) => {
  if (!data) return null;

  const camposConfig = {
    status: {
      etiqueta: "Nuevo Estado",
      icono: <FaCheckCircle />,
      color: "#2D5A27",
    },
    rol: { etiqueta: "Nuevo Rol", icono: <FaShieldAlt />, color: "#2D5A27" },
    plan: {
      etiqueta: "Nueva Subscripción",
      icono: <BsCalendar2Check />,
      color: "#2D5A27",
    },
    grupo: {
      etiqueta: "Nuevo Grupo",
      icono: <FaLayerGroup />,
      color: "#2D5A27",
    },
    acceso: {
      etiqueta: "Nuevo Modo Acceso",
      icono: <FaUserLock />,
      color: "#2D5A27",
    },
    hardware: {
      etiqueta: "Nuevo Hardware Reset",
      icono: <FaMicrochip />,
      color: "#2D5A27",
    },
  };

  return (
    <div style={styles.container}>
      {/* Título fijo: Indica que la operación terminó, sin ensuciar la lista */}
      <div style={styles.header}>
        <span style={styles.title}>OPERACIÓN COMPLETADA CON ÉXITO</span>
      </div>

      <div style={styles.row}>
        <FaPhoneAlt size={10} color="#2D5A27" />
        <span style={styles.text}>
          <b>Teléfono:</b> {data.telefono}
        </span>
      </div>

      <hr style={styles.separator} />

      {/* 2. Mapeo atómico: Solo se renderiza lo que venga en el objeto 'data' */}
      {Object.entries(camposConfig).map(
        ([key, config]) =>
          data[key] && (
            <div key={key} style={styles.row}>
              <span style={{ color: config.color, display: "flex", fontSize: "12px" }}>
                {config.icono}
              </span>
              <span style={styles.text}>
                <b>{config.etiqueta}:</b> {data[key]}
                {key === "plan" && data.vence && (
                  <span style={styles.subText}> (Vence: {data.vence})</span>
                )}
              </span>
            </div>
          )
      )}

      <button onClick={onLimpiar} style={styles.btnRed}>
        <FaEraser /> LIMPIAR
      </button>
    </div>
  );
};

const styles = {
  container: {
    background: "#F9FBF9",
    padding: "1.2rem",
    borderRadius: "15px",
    border: "1px solid #2D5A27",
    boxShadow: "0 4px 12px rgba(45,90,39,0.1)",
  },
  header: {
    marginBottom: "8px",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
    paddingBottom: "5px",
  },
  title: {
    fontSize: "11px",
    fontWeight: "900",
    color: "#2D5A27",
    letterSpacing: "1px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: "#333",
    marginBottom: "4px",
  },
  text: { lineHeight: "1.4" },
  subText: { color: "#666", fontSize: "11px", fontWeight: "normal" },
  separator: { border: "none", borderTop: "1px dashed #DDD", margin: "8px 0" },
  btnRed: {
    width: "100%",
    marginTop: "15px",
    background: "none",
    border: "none",
    color: "#C62828",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "5px",
    fontSize: "0.75rem",
  },
};
