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
    backgroundColor: colores.blanco,
    borderRadius: "20px",
    display: "flex",
    flexDirection: "row",
    gap: "0px", // Quitamos gap para que la foto pegue al borde
    border: `1px solid ${colores.hoja}30`,
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    marginBottom: "15px",
    alignItems: "stretch", // Para que la foto y la info tengan la misma altura
    overflow: "hidden", // Corta las esquinas de la foto con el radius de la card
    width: "100%",
    maxWidth: "850px", // Evita que en laptop se estire demasiado hacia los lados
  },
  fotoLaptop: {
    width: "200px",
    height: "200px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    flexShrink: 0,
  },
  fotoMobile: {
    width: "160px", // Reducido un poco para dar más espacio al texto en pantallas pequeñas
    height: "180px",
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
    gap: "4px", // Reducimos el gap para que distrito y ciudad estén más "pegados"
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