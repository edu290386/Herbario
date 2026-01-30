
import { transformarImagen } from "../../helpers/cloudinaryHelper";
import { colores } from "../../constants/tema";
import { PiPlantThin } from "react-icons/pi";

export const CarruselImagenPrincipal = ({ url, isMobile }) => {
  
  const borderRadiusEfectivo = isMobile ? "0px 0px 25px 25px" : "25px";
  const alturaEfectiva = isMobile ? "500px" : "600px";
  // Caso 1: No hay foto (Fondo retama + Icono Leaf)
  if (!url) {
    return (
      <div
        style={{
          ...styles.frame,
          height: alturaEfectiva,
          borderRadius: borderRadiusEfectivo,
          backgroundColor: colores.retama,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <PiPlantThin size={120} color={colores.frondoso} strokeWidth={1} />
      </div>
    );
  }

  // Caso 2: Hay foto -> Usamos modo "detalle" (1200px, ar_3:4)
  const urlOptimizada = transformarImagen(url, "detalle");

  return (
    <div
      style={{
        ...styles.frame,
        height: isMobile ? "500px" : "600px",
        borderRadius: isMobile ? "0px 0px 25px 25px" : "25px",
      }}
    >
      <img
        src={urlOptimizada}
        alt="Vista principal"
        loading="lazy"
        style={styles.img}
      />
    </div>
  );
};

const styles = {
  frame: {
    width: "100%",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover", // Mantiene el zoom y proporción sin deformar
  },
};
