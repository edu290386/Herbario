import React from "react";
import {
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaWikipediaW,
} from "react-icons/fa";

export const InfoHeader = ({ nombrePrincipal, nombreCientifico, redes }) => {
  return (
    <div style={styles.headerContainer}>
      <div style={styles.titleGroup}>
        <h1 style={styles.nombreComun}>{nombrePrincipal}</h1>
        <p style={styles.nombreCientifico}>
          <i>{nombreCientifico || "Nombre científico no registrado"}</i>
        </p>
      </div>

      {/* Redes Sociales */}
      {redes && (
        <div style={styles.socialLinks}>
          {redes.instagram && (
            <a
              href={redes.instagram}
              target="_blank"
              rel="noreferrer"
              style={styles.link}
            >
              <FaInstagram style={{ ...styles.icon, color: "#E1306C" }} />
            </a>
          )}
          {redes.facebook && (
            <a
              href={redes.facebook}
              target="_blank"
              rel="noreferrer"
              style={styles.link}
            >
              <FaFacebook style={{ ...styles.icon, color: "#4267B2" }} />
            </a>
          )}
          {redes.youtube && (
            <a
              href={redes.youtube}
              target="_blank"
              rel="noreferrer"
              style={styles.link}
            >
              <FaYoutube style={{ ...styles.icon, color: "#FF0000" }} />
            </a>
          )}
          {redes.wikipedia && (
            <a
              href={redes.wikipedia}
              target="_blank"
              rel="noreferrer"
              style={styles.link}
            >
              <FaWikipediaW style={{ ...styles.icon, color: "#000000" }} />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

// --- ESTILOS ---
const styles = {
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    padding: "10px 0",
    marginBottom: "15px",
    gap: "10px",
  },
  titleGroup: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  nombreComun: {
    fontSize: "28px",
    fontWeight: "900",
    color: "#2f4538", // Tu color bosque
    margin: 0,
    textTransform: "uppercase",
    lineHeight: "1.1",
    letterSpacing: "-0.5px",
  },
  nombreCientifico: {
    fontSize: "15px",
    color: "#64748b", // Color pizarra/gris
    margin: "4px 0 0 0",
    lineHeight: "1.4",
  },
  socialLinks: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    paddingTop: "5px",
  },
  link: {
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s ease",
  },
  icon: {
    fontSize: "22px",
    cursor: "pointer",
  },
};
