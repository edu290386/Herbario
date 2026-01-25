import { colores } from "../constants/tema.js";
import { UbicacionInfo } from "./UbicacionInfo.jsx";
import { calcularDistanciaPitagorica } from "../helpers/geoHelper.js";

export const CardUbicacion = ({ ubicacion, isMobile, userCoords }) => {
  // Generamos las rutas dinámicas usando el helper
  

  // 1. Extraemos los valores basándonos en tu console.log real
  const lat1 = parseFloat(userCoords?.lat);
  const lon1 = parseFloat(userCoords?.lon); // ⬅️ Cambiado de lng a lon

  const lat2 = parseFloat(ubicacion?.latitud || ubicacion?.lat);
  const lon2 = parseFloat(
    ubicacion?.longitud || ubicacion?.lon || ubicacion?.lng,
  );

  // 2. Validación y Cálculo
  const km =
    !isNaN(lat1) && !isNaN(lon1) && !isNaN(lat2) && !isNaN(lon2)
      ? calcularDistanciaPitagorica(lat1, lon1, lat2, lon2)
      : null;


 

  const fechaFormateada = ubicacion.created_at
    ? new Date(ubicacion.created_at).toLocaleDateString()
    : "Fecha no disponible";

  return (
    <div style={{ ...styles.card, minHeight: isMobile ? "140px" : "200px" }}>
      {/* IMAGEN DE CONTEXTO */}
      <div
        style={{
          ...(isMobile ? styles.fotoMobile : styles.fotoLaptop),
          backgroundImage: `url(${ubicacion.foto_contexto || "https://via.placeholder.com/300"})`,
        }}
      />

      {/* INFORMACIÓN Y BOTONES */}
      <div style={styles.info}>
        <UbicacionInfo
          distrito={ubicacion.distrito}
          ciudad={ubicacion.ciudad}
          latitud={ubicacion.latitud}
          longitud={ubicacion.longitud}
          distancia={km}
          colaborador={ubicacion.colaborador}
          fecha={fechaFormateada}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};;;

const styles = {
  card: {
    display: "flex",
    flexFlow: "row nowrap",
    width: "100%",
    maxWidth: "550px",
    overflow: "hidden",
    boxSizing: "border-box",
    boxShadow: "8px 2px 20px rgba(0,0,0,0.15)",
    borderRadius: "20px",
    backgroundColor: colores.blanco,
  },
  fotoLaptop: {
    width: "180px",
    height: "240px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    flexShrink: 0,
  },
  fotoMobile: {
    width: "160px", // Reducido un poco para dar más espacio al texto en pantallas pequeñas
    height: "auto",
    backgroundSize: "cover",
    backgroundPosition: "center",
    flexShrink: 0,
  },
  info: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "10px 10px",
    gap: "4px",
    minWidth: 0,
    overflow: "hidden",
  },
  colaboradorWrapper: {
    marginTop: "8px",
    borderTop: `1px solid ${colores.fondo}`,
    paddingTop: "6px",
  },
  colaborador: {
    fontSize: "0.8rem",
    color: "#888",
    fontStyle: "italic", // Un toque sutil para diferenciarlo de los datos geográficos
  },
};