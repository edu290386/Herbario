import React from "react";
import { CardUbicacion } from "./CardUbicación";
import { colores } from "../constants/tema";

export const SeccionUbicaciones = ({ ubicaciones, nombrePlanta, isMobile }) => {
  return (
    <div style={isMobile ? styles.containerMobile : styles.containerLaptop}>
      <div style={styles.header}>
        <h2 style={styles.titulo}>
          Ubicaciones registradas para {nombrePlanta}
        </h2>
        <span style={styles.badge}>
          {ubicaciones.length}{" "}
          {ubicaciones.length === 1
            ? "registro encontrado"
            : "registros encontrados"}
        </span>
      </div>

      <div style={styles.grid}>
        {ubicaciones.length > 0 ? (
          ubicaciones.map((ubi) => (
            <CardUbicacion key={ubi.id} ubicacion={ubi} isMobile={isMobile} />
          ))
        ) : (
          <p style={styles.sinDatos}>
            Aún no hay ubicaciones para esta planta.
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  containerLaptop: {
    width: "100%",
    maxWidth: "900px",
    margin: "40px auto", // Separación clara del bloque superior
    padding: "20px",
    backgroundColor: "transparent", // OPCIÓN 1: Deja ver el fondo #F1F2ED
    boxSizing: "border-box",
  },
  containerMobile: {
    width: "100%",
    padding: "20px",
    backgroundColor: "transparent",
    marginTop: "10px",
    boxSizing: "border-box", // <--- CRÍTICO
    overflowX: "hidden",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  titulo: {
    fontSize: "1.4rem",
    color: colores.bosque,
    marginBottom: "8px",
  },
  badge: {
    backgroundColor: colores.bosque,
    color: "#fff",
    padding: "5px 15px",
    borderRadius: "20px",
    fontSize: "0.85rem",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: "20px", // Espacio entre las cards blancas
  },
  sinDatos: {
    textAlign: "center",
    color: "#888",
    fontStyle: "italic",
  },
};
