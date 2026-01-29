import { colores } from "../../constants/tema.js";
import { UbicacionInfo } from "./UbicacionInfo.jsx";
import { calcularDistanciaPitagorica } from "../../helpers/geoHelper.js";


export const CardUbicacion = ({ ubicacion, isMobile, userCoords, onEliminar }) => {
  


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

  const cardClassName = `card-herbario-${isMobile ? "mobile" : "desktop"}`;

  return (
    <>
      <style>
        {`
          @media (orientation: landscape) and (max-width: 900px) {
            .${cardClassName} { 
              height: 280px !important; 
              max-width: 600px !important; 
            }
            .${cardClassName} .foto-contexto { 
              width: 210px !important; 
              height: 280px !important; 
            }
            /* TEXTOS: Igualamos a Desktop */
            .${cardClassName} h4 { font-size: 1.1rem !important; }
            .${cardClassName} span { font-size: 0.95rem !important; }
            .${cardClassName} b { font-size: 0.95rem !important; }

             /* ICONOS DE FILA (Casa, Ciudad, etc): Desktop usa 20px */
            .${cardClassName} .info-icon { 
              width: 20px !important; 
              height: 20px !important; 
             }

            /* ICONOS DE ACCIÓN (Maps, Waze, WS): Desktop usa 28px */
            .${cardClassName} .action-icon { 
              width: 28px !important; 
              height: 28px !important; 
            }

            /* ICONO ELIMINAR: Desktop usa 40px */
            .${cardClassName} .delete-icon { 
              width: 40px !important; 
              height: 40px !important; 
            }
          }
        `}
      </style>
      <div
        className={cardClassName}
        style={{
          ...styles.card,
          minHeight: "220px",
          maxWidth: isMobile ? "650px" : "550px",
        }}
      >
        {/* IMAGEN DE CONTEXTO */}
        <div
          className="foto-contexto"
          style={{
            ...(isMobile ? styles.fotoMobile : styles.fotoLaptop),
            backgroundImage: `url(${ubicacion.foto_contexto || "https://via.placeholder.com/300"})`,
          }}
        />

        {/* INFORMACIÓN Y BOTONES */}
        <div style={styles.info}>
          <UbicacionInfo
            ubicacionID={ubicacion.id}
            distrito={ubicacion.distrito}
            ciudad={ubicacion.ciudad}
            latitud={ubicacion.latitud}
            longitud={ubicacion.longitud}
            distancia={km}
            fecha={ubicacion.created_at}
            isMobile={isMobile}
            creadorID={ubicacion.usuario_id}
            creador={ubicacion.usuarios.nombre_completo}
            grupocreador={ubicacion.usuarios.grupos?.nombre_grupo ?? "Sin grupo"}
            onEliminar={onEliminar}
          />
        </div>
      </div>
    </>
  );
};;;

const styles = {
  card: {
    display: "flex",
    flexFlow: "row nowrap",
    width: "100%",
    overflow: "hidden",
    boxSizing: "border-box",
    boxShadow: "8px 2px 20px rgba(0,0,0,0.15)",
    borderRadius: "20px",
    backgroundColor: colores.blanco,
    margin: "10px auto",
    transition: "all 0.3s ease",
  },
  fotoLaptop: {
    width: "180px",
    height: "250px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    flexShrink: 0,
  },
  fotoMobile: {
    width: "160px", // Reducido un poco para dar más espacio al texto en pantallas pequeñas
    height: "220px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    flexShrink: 0,
  },
  info: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "10px 10px",
    gap: "4px",
    minWidth: 0,
    overflow: "hidden",
  },
  colaborador: {
    fontSize: "0.8rem",
    color: "#888",
    fontStyle: "italic", // Un toque sutil para diferenciarlo de los datos geográficos
  },
};