import React from "react";
import { transformarImagen } from "../helpers/cloudinaryHelper";

export const CarruselMiniaturas = ({
  imagenes,
  indiceActivo,
  setIndiceActivo,
}) => {
  return (
    <div style={styles.thumbContainer}>
      {imagenes.map((img, i) => {
        const estaSeleccionada = i === indiceActivo;
        return (
          <div
            key={i}
            onClick={() => setIndiceActivo(i)}
            style={{
              ...styles.thumbWrapper,
              transform: estaSeleccionada ? "scale(1.2)" : "scale(1)",
              zIndex: estaSeleccionada ? 10 : 1,
              border: estaSeleccionada ? "2px solid #2D5A27" : "none",
            }}
          >
            <img
              src={transformarImagen(img, "card")}
              style={styles.thumbImg}
              alt={`Miniatura ${i}`}
              loading="lazy"
            />
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  thumbContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    padding: "10px 0",
  },
  thumbWrapper: {
    width: "65px",
    height: "65px",
    borderRadius: "12px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.3s ease",
  },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover" },
};
