import { useState } from "react";
import { colores } from "../constants/tema";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { transformarImagen } from "../helpers/cloudinaryHelper";

export const CarruselDetalle = ({ imagenes, isMobile }) => {
  const [indice, setIndice] = useState(0);

  if (!imagenes || imagenes.length === 0) return null;

  return (
    <div style={styles.container}>
      {/* 1. IMAGEN PRINCIPAL - 550px de alto para ambos */}
      <div
        style={{
          ...styles.mainWrapper,
          borderRadius: isMobile ? "0px 0px 25px 25px" : "25px",
          height: isMobile ? "500px" : "600px",
        }}
      >
        <img
          src={transformarImagen(imagenes[indice], "detalle")}
          alt="Vista principal"
          style={styles.mainImg}
        />

        {/* Flechas de navegación */}
        <button
          onClick={() =>
            setIndice(indice === 0 ? imagenes.length - 1 : indice - 1)
          }
          style={{ ...styles.navBtn, left: "15px" }}
        >
          <IoIosArrowBack size={24} />
        </button>

        <button
          onClick={() =>
            setIndice(indice === imagenes.length - 1 ? 0 : indice + 1)
          }
          style={{ ...styles.navBtn, right: "15px" }}
        >
          <IoIosArrowForward size={24} />
        </button>
      </div>

      {/* 2. MINIATURAS - Solo se muestran si NO es móvil */}
      {!isMobile && (
        <div style={styles.thumbContainer}>
          {imagenes.map((img, i) => {
            const estaSeleccionada = i === indice;
            return (
              <div
                key={i}
                onClick={() => setIndice(i)}
                style={{
                  ...styles.thumbWrapper,
                  // EFECTO 1: Agrandar (Scale)
                  transform: estaSeleccionada ? "scale(1.2)" : "scale(1)",

                  zIndex: estaSeleccionada ? 10 : 1,
                }}
              >
                <img
                  src={transformarImagen(img, "card")}
                  style={styles.thumbImg}
                  alt={`Miniatura ${i}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    maxWidth: "600px", // Un poco más ancho para aprovechar los 550px de alto
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "35px", // MÁS ESPACIO entre imagen y miniaturas
  },
  mainWrapper: {
    position: "relative",
    width: "100%",
    
    borderRadius: "20px",
    overflow: "hidden",
    backgroundColor: "#f4f4f4",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  mainImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
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
    transition: "transform 0.3s ease, border 0.3s ease", // Animación suave
    flexShrink: 0,
    backgroundColor: "#fff",
  },
  thumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  navBtn: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    borderRadius: "50%",
    width: "45px",
    height: "45px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 2,
    color: colores.bosque,
    backgroundColor: colores.retama, // Fondo oscuro semitransparente para que resalte
    
  },
};
