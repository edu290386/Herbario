import { useState } from "react";
import { TbChevronUp } from "react-icons/tb";
import { TbChevronDown } from "react-icons/tb";

export const InfoAcordeones = ({ secciones = [] }) => {
  const [abierto, setAbierto] = useState(0);

  return (
    <div style={styles.container}>
      <h4 style={styles.labelSeccion}>Ficha Técnica</h4>
      {secciones.map((sec, i) => (
        <div
          key={i}
          style={{
            ...styles.folder,
            backgroundColor:
              abierto === i
                ? "rgba(255, 255, 255, 0.7)"
                : "rgba(255, 255, 255, 0.3)",
            boxShadow: abierto === i ? "0 8px 20px rgba(0,0,0,0.06)" : "none",
          }}
        >
          <button
            style={styles.folderHeader}
            onClick={() => setAbierto(abierto === i ? -1 : i)}
          >
            <div style={styles.titleGroup}>
              {/* El punto verde conversa con el estilo del Header Innovador */}
              <div
                style={{
                  ...styles.dot,
                  backgroundColor: abierto === i ? "#2d8b57" : "#ccc",
                }}
              />
              <span
                style={{
                  ...styles.folderTitle,
                  color: abierto === i ? "#1a1a1a" : "#666",
                }}
              >
                {sec.titulo}
              </span>
            </div>
            {abierto === i ? (
              <TbChevronUp size={18} color="#2d8b57" />
            ) : (
              <TbChevronDown size={18} color="#999" />
            )}
          </button>

          {abierto === i && (
            <div style={styles.content}>
              <p style={styles.folderText}>{sec.contenido}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    marginTop: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  labelSeccion: {
    fontSize: "9px",
    fontWeight: "900",
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    marginBottom: "4px",
  },
  folder: {
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    overflow: "hidden",
  },
  folderHeader: {
    width: "100%",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  titleGroup: { display: "flex", alignItems: "center", gap: "10px" },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    transition: "all 0.3s",
  },
  folderTitle: {
    fontSize: "14px",
    fontWeight: "900",
    letterSpacing: "-0.2px",
    textTransform: "uppercase",
  },
  content: { padding: "0 16px 16px 32px", animation: "fadeIn 0.4s ease" },
  folderText: { fontSize: "14px", color: "#444", lineHeight: "1.6", margin: 0 },
};
