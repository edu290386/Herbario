import { useState } from "react";
import { TbWorld, TbChevronUp, TbChevronDown } from "react-icons/tb";
import { FaCheckCircle } from "react-icons/fa";
import { GiAfrica } from "react-icons/gi";

const renderBandera = (codigoPais) => {
  const code = codigoPais?.toLowerCase();
  if (code === "world") return <TbWorld size={16} color="#555" />;
  if (code === "yoruba") return <GiAfrica size={16} color="#8d6e63" />;
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      width="17"
      style={{ borderRadius: "2px", objectFit: "cover" }}
      alt={codigoPais}
      onError={(e) => (e.target.style.display = "none")}
    />
  );
};

export const FichaInteractiva = ({ planta }) => {
  const [seccionAbierta, setSeccionAbierta] = useState("nombres");

  return (
    <div style={styles.container}>
      {/* SECCIÓN A: NOMBRES INTERNACIONALES */}
      <div
        style={{
          ...styles.folder,
          backgroundColor:
            seccionAbierta === "nombres"
              ? "rgba(255,255,255,0.8)"
              : "rgba(255,255,255,0.3)",
        }}
      >
        <button
          style={styles.folderHeader}
          onClick={() =>
            setSeccionAbierta(seccionAbierta === "nombres" ? null : "nombres")
          }
        >
          <div style={styles.titleGroup}>
            <div
              style={{
                ...styles.dot,
                backgroundColor:
                  seccionAbierta === "nombres" ? "#2d8b57" : "#ccc",
              }}
            />
            <span style={styles.folderTitle}>Nombres Internacionales</span>
          </div>
          {seccionAbierta === "nombres" ? (
            <TbChevronUp size={18} />
          ) : (
            <TbChevronDown size={18} />
          )}
        </button>

        {seccionAbierta === "nombres" && (
          <div style={styles.content}>
            {planta.nombres_internacionales?.map((bloque, i) => {
              const nombresOficiales = bloque.nombres.filter(
                (n) => n.verificado,
              );
              if (nombresOficiales.length === 0) return null;

              return (
                <div key={i} style={styles.filaPais}>
                  <div style={styles.paisIdentificador}>
                    {renderBandera(bloque.pais)}
                    <span style={styles.siglaPais}>
                      {bloque.pais.toUpperCase()}:
                    </span>
                  </div>
                  <div style={styles.nombresInline}>
                    {nombresOficiales.map((n, idx) => (
                      <div key={idx} style={styles.itemNombre}>
                        <span style={styles.textoNombre}>{n.texto}</span>
                        <FaCheckCircle size={10} color="#2d8b57" />
                        {idx < nombresOficiales.length - 1 && (
                          <span style={styles.separador}>•</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECCIÓN B: FICHAS TÉCNICAS DINÁMICAS */}
      {planta.secciones_info?.map((sec, i) => (
        <div
          key={i}
          style={{
            ...styles.folder,
            backgroundColor:
              seccionAbierta === `sec-${i}`
                ? "rgba(255,255,255,0.8)"
                : "rgba(255,255,255,0.3)",
          }}
        >
          <button
            style={styles.folderHeader}
            onClick={() =>
              setSeccionAbierta(
                seccionAbierta === `sec-${i}` ? null : `sec-${i}`,
              )
            }
          >
            <div style={styles.titleGroup}>
              <div
                style={{
                  ...styles.dot,
                  backgroundColor:
                    seccionAbierta === `sec-${i}` ? "#2d8b57" : "#ccc",
                }}
              />
              <span style={styles.folderTitle}>{sec.titulo}</span>
            </div>
            {seccionAbierta === `sec-${i}` ? (
              <TbChevronUp size={18} />
            ) : (
              <TbChevronDown size={18} />
            )}
          </button>
          {seccionAbierta === `sec-${i}` && (
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
  container: { display: "flex", flexDirection: "column", gap: "8px" },
  folder: {
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    overflow: "hidden",
    transition: "all 0.3s",
  },
  folderHeader: {
    width: "100%",
    padding: "14px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  titleGroup: { display: "flex", alignItems: "center", gap: "10px" },
  dot: { width: "6px", height: "6px", borderRadius: "50%" },
  folderTitle: {
    fontSize: "13px",
    fontWeight: "900",
    textTransform: "uppercase",
    color: "#1a1a1a",
  },
  content: { padding: "0 16px 16px 16px" },
  folderText: { fontSize: "14px", color: "#444", lineHeight: "1.6", margin: 0 },
  filaPais: {
    display: "flex",
    gap: "10px",
    padding: "10px 0",
    borderBottom: "1px solid rgba(0,0,0,0.03)",
  },
  paisIdentificador: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    minWidth: "70px",
  },
  siglaPais: { fontSize: "11px", fontWeight: "900", color: "#999" },
  nombresInline: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px 10px",
    flex: 1,
    alignItems: "center",
  },
  itemNombre: { display: "flex", alignItems: "center", gap: "4px" },
  textoNombre: { fontSize: "15px", fontWeight: "700", color: "#1a1a1a" },
  separador: { color: "#ccc", marginLeft: "4px" },
};
