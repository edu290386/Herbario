import React from "react";
import { colores } from "../constants/tema";
import {
  FaRegCalendarCheck,
  FaUserPlus,
  FaCar,
  FaMapMarkerAlt,
  FaMapMarker,
} from "react-icons/fa";
import { TiDelete } from "react-icons/ti";
import { FaHouse, FaCity } from "react-icons/fa6";
import { SiGooglemaps, SiWaze, SiWhatsapp } from "react-icons/si";
import { generarRutas } from "../helpers/linkHelper";
import { BiMapPin } from "react-icons/bi";

export const UbicacionInfo = ({
  distrito,
  ciudad,
  latitud,
  longitud,
  distancia,
  colaborador,
  fecha,
  isMobile,
}) => {
  const { google, waze } = generarRutas(latitud, longitud);

  // 1. CONFIGURACIÓN DE TAMAÑOS DINÁMICOS
  const sizes = {
    iconosFila: isMobile ? 17 : 20, // Casa, Ciudad, User, Calendario
    iconosAccion: isMobile ? 24 : 28, // Maps, Waze, WS
    iconoDelete: isMobile ? 30 : 40, // Tacho
    fuenteTitulo: isMobile ? "0.8rem" : "1.1rem",
    fuenteTexto: isMobile ? "0.8rem" : "0.95rem",
  };

  const manejarNavegacion = (url) => {
    if (!isMobile) {
      window.open(url, "_blank");
    } else {
      window.location.href = url;
    }
  };

  return (
    <div style={styles.contenedor}>
      {/* 1. DISTRITO */}
      <div style={styles.filaSimple}>
        <FaHouse size={sizes.iconosFila} color={colores.bosque} />
        <h4
          style={{
            ...styles.distrito,
            fontSize: sizes.fuenteTitulo,
            letterSpacing: isMobile ? "-1.6px" : "normal",
          }}
        >
          {distrito || "Distrito no especificado"}
        </h4>
      </div>

      {/* 2. CIUDAD */}
      <div style={styles.filaSimple}>
        <FaCity size={sizes.iconosFila} color={colores.bosque} />
        <span style={{ ...styles.ciudadTexto, fontSize: sizes.fuenteTexto }}>
          {ciudad || "Lima, Perú"}
        </span>
      </div>

      {/* 3. DISTANCIA */}
      {distancia && (
        <div style={styles.badgeDistancia}>
          <div style={styles.textoDistancia}>
            <FaCar size={isMobile ? 17 : 18} color="#000000" />
            <span style={{ fontSize: sizes.fuenteTexto }}>{distancia} Km</span>
          </div>
        </div>
      )}

      {/* 4. COLABORADOR */}
      <div style={styles.filaSimple}>
        <FaUserPlus size={sizes.iconosFila} color="#000000" />
        <span style={{ ...styles.infoSecundaria, fontSize: sizes.fuenteTexto }}>
          <b>{colaborador || "Admin"}</b>
        </span>
      </div>

      {/* 5. FECHA */}
      <div style={styles.filaSimple}>
        <FaRegCalendarCheck size={sizes.iconosFila} color="#000" />
        <span style={{ ...styles.fechaTexto, fontSize: sizes.fuenteTexto }}>
          {fecha || "S/N"}
        </span>
      </div>

      {/* 6. ACCIONES */}
      <div style={styles.acciones}>
        <div style={styles.contenedorNavegacion}>
          <button
            onClick={() => manejarNavegacion(google)}
            style={styles.btnIcono}
          >
            <BiMapPin color="#B6452C" size={sizes.iconosAccion} />
          </button>
          <button
            onClick={() => manejarNavegacion(waze)}
            style={styles.btnIcono}
          >
            <SiWaze color="#2A9DF4" size={sizes.iconosAccion} />
          </button>
          <button style={{ ...styles.btnIcono, marginLeft: "4px" }}>
            <SiWhatsapp size={sizes.iconosAccion} color="#25D366" />
          </button>
        </div>

        <div style={styles.contenedorEliminar}>
          <button
            style={styles.btnIcono}
            onClick={() => console.log("Eliminar ubicación")}
            title="Eliminar ubicación"
          >
            <TiDelete size={sizes.iconoDelete} color="#D32F2F" />
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  contenedor: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    overflow: "hidden",
    gap: "8px",
    padding: "0px",
  },
  filaSimple: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    minWidth: 0,
    overflow: "hidden",
  },
  distrito: {
    fontWeight: "700",
    color: colores.bosque,
    margin: 0,
    whiteSpace: "nowrap", // Prohíbe el salto de línea
    overflow: "hidden", // Esconde lo que sobra
    textOverflow: "ellipsis", // Agrega los "..."
    flex: 1,
    minWidth: 0,
  },
  ciudadTexto: {
    color: colores.bosque,
    fontWeight: "600",
  },
  badgeDistancia: {
    alignSelf: "flex-start",
  },
  textoDistancia: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#000",
    fontWeight: "800",
  },
  infoSecundaria: {
    color: "#333",
    fontWeight: "330",
    fontStyle: "italic",
  },
  fechaTexto: {
    color: "#777",
    fontStyle: "italic",
  },
  acciones: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "4px",
    borderTop: "1px solid #eee",
  },
  contenedorNavegacion: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  contenedorEliminar: {
    display: "flex",
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
