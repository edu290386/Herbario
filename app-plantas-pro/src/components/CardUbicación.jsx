import React from "react";
import { colores } from "../constants/tema.js";
import { generarRutas } from "../helpers/linkHelper.js";
import { SiGooglemaps, SiWaze, SiTiktok, SiWhatsapp, SiYoutube } from "react-icons/si";

export const CardUbicacion = ({ ubicacion, isMobile }) => {
  // Generamos las rutas dinámicas usando el helper
  const { google, waze } = generarRutas(ubicacion.latitud, ubicacion.longitud);

  // Navegación inteligente: Laptop abre pestaña, Móvil abre App
  const manejarNavegacion = (url) => {
    if (!isMobile) {
      window.open(url, "_blank");
    } else {
      window.location.href = url;
    }
  };

  return (
    <div style={styles.card}>
      {/* IMAGEN DE CONTEXTO */}
      <div
        style={{
          ...(isMobile ? styles.fotoMobile : styles.fotoLaptop),
          backgroundImage: `url(${ubicacion.foto_contexto || "https://via.placeholder.com/300"})`,
        }}
      />

      {/* INFORMACIÓN Y BOTONES */}
      <div style={styles.info}>
        <div>
          <h3 style={styles.titulo}>
            {ubicacion.distrito || "Distrito no especificado"}
          </h3>
          <p style={styles.ciudad}>{ubicacion.ciudad || "Ciudad"}</p>

          <div style={styles.colaboradorWrapper}>
            <span style={styles.colaborador}>
              Aporte: <strong>{ubicacion.colaborador || "Anónimo"}</strong>
            </span>
          </div>
        </div>

        {/* CONTENEDOR DE ICONOS (Sin bordes, solo el icono) */}
        <div style={styles.contenedorBotones}>
          <button
            onClick={() => manejarNavegacion(google)}
            style={styles.btnIcono}
          >
            <SiGooglemaps color="#EA4335" size={26} />
          </button>
          <button
            onClick={() => manejarNavegacion(waze)}
            style={styles.btnIcono}
          >
            <SiWaze color="#33CCFF" size={26} />
          </button>
          <button style={styles.btnIcono}>
            <SiWhatsapp size={25} color="#25D366" />
          </button>
          <button style={styles.btnIcono}>
            <SiTiktok size={24} color="#000" />
          </button>
          <button style={styles.btnIcono}>
            <SiYoutube size={29} color="#FF0000" />
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: colores.blanco,
    borderRadius: "20px",
    padding: "15px",
    display: "flex",
    flexDirection: "row", // Mantenemos fila para que se vea como la imagen de Nano Banana
    gap: "15px",
    border: `1px solid ${colores.hoja}30`,
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    marginBottom: "10px",
    alignItems: "center",
  },
  fotoLaptop: {
    width: "150px",
    height: "100px",
    borderRadius: "12px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    flexShrink: 0,
  },
  fotoMobile: {
    width: "100px",
    height: "100px",
    borderRadius: "12px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    flexShrink: 0,
  },
  info: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  },
  titulo: { margin: 0, fontSize: "1.1rem", color: colores.bosque },
  ciudad: { margin: "2px 0", fontSize: "0.85rem", color: "#888" },
  colaboradorWrapper: { marginTop: "5px" },
  colaborador: { fontSize: "0.8rem", color: "#666" },
  contenedorBotones: {
    display: "flex",
    gap: "12px",
    marginTop: "10px",
    alignItems: "center",
  },
  btnIcono: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
};