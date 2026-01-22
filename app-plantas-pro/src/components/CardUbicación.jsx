import React, { useState, useEffect } from "react";
import { colores } from "../constants/tema.js";
import { generarRutas } from "../helpers/linkHelper.js";
import { SiGooglemaps, SiWaze, SiWhatsapp, SiTiktok, SiYoutube } from "react-icons/si";

export const CardUbicacion = ({ data }) => {
  const { google, waze } = generarRutas(data.latitud, data.longitud);
  const [esLaptop, setEsLaptop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setEsLaptop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Función para manejar la redirección inteligente
  const manejarNavegacion = (url) => {
    if (esLaptop) {
      window.open(url, "_blank"); // Pestaña nueva en PC
    } else {
      window.location.href = url; // Abrir app en móvil
    }
  };

  return (
    <div style={esLaptop ? styles.cardLaptop : styles.cardMobile}>
      {/* 1. CORRECCIÓN DE FOTO: Usamos data.foto_contexto directamente */}
      <div
        style={{
          ...(esLaptop ? styles.fotoLaptop : styles.fotoMobile),
          backgroundImage: `url(${data.foto_contexto || "https://via.placeholder.com/300"})`,
        }}
      />

      <div style={styles.info}>
        <div>
          <h3 style={styles.titulo}>{data.distrito}</h3>
          <p style={styles.ciudad}>{data.ciudad}</p>

          {/* Espacio para el colaborador (lo activamos en el siguiente paso) */}
          <span style={styles.colaborador}>
            Aporte: {data.colaborador || "Anónimo"}
          </span>
        </div>

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
            <SiWaze color="#00B8F1" size={26} />
          </button>
          <button style={styles.btnIcono}>
            <SiWhatsapp size={25} color="#25D366" />
          </button>
          <button style={styles.btnIcono}>
            <SiTiktok size={24} color="#000000" />
          </button>
          <button style={styles.btnIcono}>
            <SiYoutube size={29} color="#FF0000" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ESTILOS AL FINAL
const styles = {
  cardLaptop: {
    display: "flex",
    backgroundColor: "#fff",
    borderRadius: "15px", // Bordes redondeados más pronunciados
    boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
    overflow: "hidden",
    height: "160px",
    width: "100%",
    maxWidth: "650px", // LIMITE PARA LAPTOP
    margin: "15px auto", // Centrada
    border: "1px solid #eee",
  },
  cardMobile: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: "15px", // BORDER RADIUS EN MÓVIL
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    overflow: "hidden", // Importante para que la foto no tape las esquinas
    width: "92%", // NO OCUPA EL 100% (Deja margen)
    margin: "10px auto", // Centrada con espacio entre cards
    border: "1px solid #eee",
  },
  fotoLaptop: {
    width: "220px",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  fotoMobile: {
    width: "100%",
    height: "180px",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  info: {
    flex: 1,
    padding: "15px 20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  titulo: {
    margin: 0,
    color: colores.bosque || "#2d5a27",
    fontSize: "1.15rem",
    fontWeight: "700",
  },
  ciudad: {
    margin: "2px 0",
    color: "#666",
    fontSize: "0.85rem",
  },
  colaborador: {
    fontSize: "0.7rem",
    color: "#aaa",
    fontStyle: "italic",
    marginTop: "5px",
    display: "block",
  },
  contenedorBotones: {
    display: "flex",
    gap: "25px",
    alignItems: "center",
    marginTop: "10px",
  },
  btnIcono: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    transition: "transform 0.1s ease",
  },
};