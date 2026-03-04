import { useState } from "react";
import {
  TbBrandYoutubeFilled,
  TbLink,
  TbChevronUp,
  TbChevronDown,
} from "react-icons/tb";
import { AiFillTikTok, AiFillFacebook } from "react-icons/ai";
import { SiInstagram } from "react-icons/si";

const CONFIG_REDES = {
  youtube: { icono: TbBrandYoutubeFilled, color: "#FF0000", label: "Youtube" },
  tiktok: { icono: AiFillTikTok, color: "#000000", label: "Tik Tok" },
  facebook: { icono: AiFillFacebook, color: "#1877F2", label: "Facebook" },
  instagram: { icono: SiInstagram, color: "#E1306C", label: "Instagram" },
  web: { icono: TbLink, color: "#666", label: "Web" },
};

export const InfoRedesSociales = ({ enlacesRedesSocialesJson = [] }) => {
  const [abierto, setAbierto] = useState(false);

  if (!enlacesRedesSocialesJson || enlacesRedesSocialesJson.length === 0)
    return null;

  // Agrupación por plataforma
  const enlacesAgrupados = enlacesRedesSocialesJson.reduce((acc, curr) => {
    const plataforma = curr.plataforma.toLowerCase();
    if (!acc[plataforma]) acc[plataforma] = [];
    acc[plataforma].push(curr);
    return acc;
  }, {});

  return (
    <div
      style={{
        ...styles.folder,
        backgroundColor: abierto
          ? "rgba(255, 255, 255, 0.7)"
          : "rgba(255, 255, 255, 0.3)",
        boxShadow: abierto ? "0 8px 20px rgba(0,0,0,0.06)" : "none",
      }}
    >
      {/* HEADER */}
      <button style={styles.folderHeader} onClick={() => setAbierto(!abierto)}>
        <div style={styles.titleGroup}>
          <div
            style={{
              ...styles.dot,
              backgroundColor: abierto ? "#e1306c" : "#ccc",
            }}
          />
          <span
            style={{
              ...styles.folderTitle,
              color: abierto ? "#1a1a1a" : "#666",
            }}
          >
            ENLACES Y REDES
          </span>
        </div>
        {abierto ? (
          <TbChevronUp size={18} color="#e1306c" />
        ) : (
          <TbChevronDown size={18} color="#999" />
        )}
      </button>

      {/* CONTENIDO HORIZONTAL */}
      {abierto && (
        <div style={styles.content}>
          <div style={styles.listaAgrupada}>
            {Object.keys(enlacesAgrupados).map((red) => {
              const config = CONFIG_REDES[red] || CONFIG_REDES.web;
              const Icono = config.icono;

              return (
                <div key={red} style={styles.filaPlataforma}>
                  {/* Etiqueta de la plataforma a la izquierda */}
                  <div style={styles.plataformaLabel}>
                    <Icono size={14} color={config.color} />
                    <span style={styles.nombreRed}>{config.label}:</span>
                  </div>

                  {/* Enlaces a la derecha en la misma línea */}
                  <div style={styles.linksWrapper}>
                    {enlacesAgrupados[red].map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.linkAnchor}
                      >
                        {link.titulo || `Link ${i + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  folder: {
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    backdropFilter: "blur(12px)",
    transition: "all 0.3s ease",
    overflow: "hidden",
    marginTop: "8px",
  },
  folderHeader: {
    width: "100%",
    padding: "10px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  titleGroup: { display: "flex", alignItems: "center", gap: "10px" },
  dot: { width: "6px", height: "6px", borderRadius: "50%" },
  folderTitle: { fontSize: "12px", fontWeight: "900", letterSpacing: "0.5px" },

  content: { padding: "0 16px 12px 16px", animation: "fadeIn 0.3s ease" },

  listaAgrupada: { display: "flex", flexDirection: "column", gap: "8px" },

  filaPlataforma: {
    display: "flex",
    alignItems: "center", // Todo en una línea
    gap: "10px",
    padding: "4px 0",
    borderBottom: "1px solid rgba(0,0,0,0.03)",
  },

  plataformaLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    minWidth: "65px", // Espacio fijo para las etiquetas para que los links se alineen
  },

  nombreRed: { fontSize: "10px", fontWeight: "900", color: "#999" },

  linksWrapper: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px 12px",
    flex: 1,
  },

  linkAnchor: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1877F2",
    textDecoration: "none",
  },
};
