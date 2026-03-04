import { useState } from "react";
import { TbBrandYoutubeFilled, TbLink } from "react-icons/tb";
import { AiFillTikTok, AiFillFacebook } from "react-icons/ai";
import { SiInstagram } from "react-icons/si";

const ICONOS_REDES = {
  youtube: {
    icono: TbBrandYoutubeFilled,
    color: "#FF0000",
    glow: "rgba(255, 0, 0, 0.4)",
    size: 28,
  },
  tiktok: {
    icono: AiFillTikTok,
    color: "#000000",
    glow: "rgba(0, 0, 0, 0.2)",
    size: 28,
  },
  facebook: {
    icono: AiFillFacebook,
    color: "#1877F2",
    glow: "rgba(24, 119, 242, 0.4)",
    size: 28,
  },
  // Bajamos el tamaño de Instagram a 24 para que no compita tanto visualmente
  instagram: {
    icono: SiInstagram,
    color: "#E1306C",
    glow: "rgba(225, 48, 108, 0.5)",
    size: 24,
  },
  web: {
    icono: TbLink,
    color: "#666666",
    glow: "rgba(102, 102, 102, 0.3)",
    size: 26,
  },
};

export const InfoRedesSociales = ({ enlacesRedesSocialesJson = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!enlacesRedesSocialesJson || enlacesRedesSocialesJson.length === 0)
    return null;

  return (
    <div style={styles.contenedorRedes}>
      {enlacesRedesSocialesJson.map((itemRed, indice) => {
        const plataformaKey = itemRed.plataforma.toLowerCase();
        const config = ICONOS_REDES[plataformaKey] || ICONOS_REDES.web;
        const IconoComponente = config.icono;
        const isHovered = hoveredIndex === indice;

        return (
          <a
            key={indice}
            href={itemRed.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHoveredIndex(indice)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              ...styles.botonIcono,
              color: config.color,
              transform: isHovered
                ? "translateY(-5px) scale(1.15)"
                : "scale(1)",
              filter: isHovered
                ? `drop-shadow(0 5px 8px ${config.glow})`
                : "none",
              opacity: hoveredIndex !== null && !isHovered ? 0.6 : 1, // Efecto de enfoque
            }}
            title={`Ver en ${itemRed.plataforma}`}
          >
            <IconoComponente size={config.size} />
          </a>
        );
      })}
    </div>
  );
};

const styles = {
  contenedorRedes: {
    display: "flex",
    gap: "18px",
    marginTop: "12px",
    padding: "8px 0",
    alignItems: "center",
  },
  botonIcono: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    textDecoration: "none",
  },
};
