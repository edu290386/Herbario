import React from "react";
import { CardUbicacion } from "./CardUbicacion";
import { colores } from "../constants/tema";

export const SeccionUbicaciones = ({
  ubicaciones,
  nombrePlanta,
  isMobile,
  userCoords,
}) => {
  // Filtramos las que tienen coordenadas válidas
  const ubicacionesLimpias = ubicaciones.filter(
    (u) => u.latitud !== null && u.longitud !== null,
  );

  return (
    <div style={isMobile ? styles.containerMobile : styles.containerLaptop}>
      {/* HEADER: Título y contador */}
      <div style={styles.header}>
        <h2 style={styles.titulo}>
          Ubicaciones registradas de: {nombrePlanta}
        </h2>
        <span style={styles.badge}>
          {ubicacionesLimpias.length}{" "}
          {ubicacionesLimpias.length === 1
            ? "registro encontrado"
            : "registros encontrados"}
        </span>
      </div>

      {/* GRID DINÁMICO: 1 col en mobile, 2 en laptop */}
      <div
        style={{
          ...styles.grid,
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "5px" : "20px",
        }}
      >
        {ubicacionesLimpias.length > 0 ? (
          ubicacionesLimpias.map((ubi, index) => (
            <CardUbicacion
              key={ubi.id}
              ubicacion={ubi}
              userCoords={userCoords}
              isMobile={isMobile}
              orden={index + 1} // Enviamos el ranking de cercanía
            />
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
    maxWidth: "1200px", // Aumentado para dar aire a las 2 columnas
    margin: "0px auto",
    padding: "20px",
    backgroundColor: "transparent",
    boxSizing: "border-box",
  },
  containerMobile: {
    width: "100%",
    padding: "10px",
    backgroundColor: "transparent",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  titulo: {
    fontSize: "1.4rem",
    color: colores.bosque,
    marginBottom: "30px",
    fontWeight: "500",
  },
  badge: {
    backgroundColor: colores.bosque,
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "15px",
    fontSize: "0.85rem",
    fontWeight: "400",
  },
  grid: {
    display: "grid",
    width: "100%",
    
  },
  sinDatos: {
    gridColumn: "1 / -1", // Hace que el mensaje ocupe todo el ancho del grid
    textAlign: "center",
    color: "#888",
    padding: "40px",
    fontStyle: "italic",
  },
};
