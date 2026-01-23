import { colores } from "../constants/tema.js";
import { generarRutas } from "../helpers/linkHelper.js";
import { SiGooglemaps, SiWaze, SiTiktok, SiWhatsapp, SiYoutube } from "react-icons/si";
import { UbicacionInfo } from "./UbicacionInfo.jsx";

export const CardUbicacion = ({ ubicacion, isMobile, userCoords }) => {
  // Generamos las rutas dinámicas usando el helper
  const { google, waze } = generarRutas(ubicacion.latitud, ubicacion.longitud);

  // Navegación inteligente: Laptop abre pestaña, Móvil abre App
  const manejarNavegacion = (url) => {
    if (!isMobile) {
      window.open(url, "_blank");
    } else {
      window.location.href = url;
    }
  };

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
          idUbicacion={ubicacion.id}
          lat={ubicacion.latitud}
          lon={ubicacion.longitud}
          distritoDB={ubicacion.distrito}
          ciudadDB={ubicacion.ciudad}
          colaborador={ubicacion.colaborador || "Admin"} 
          userCoords={userCoords}
        />

        {/* CONTENEDOR DE ICONOS (Sin bordes, solo el icono) */}
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
            <SiWaze color="#33CCFF" size={26} />
          </button>
          <button style={styles.btnIcono}>
            <SiWhatsapp size={25} color="#25D366" />
          </button>
        </div>
      </div>
    </div>
  );
};

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
    padding: "15px 20px",
    gap: "4px", // Reducimos el gap para que distrito y ciudad estén más "pegados"
  },
  distrito: {
    margin: 0,
    fontSize: "0.8rem", // Mismo tamaño que ciudad
    fontWeight: "400", // Negrita marcada
    color: colores.bosque,
    lineHeight: "1.2",
  },
  ciudad: {
    margin: 0,
    fontSize: "0.9rem", // Mismo tamaño que distrito
    color: "#666", // Un gris un poco más oscuro para que no se pierda
    fontWeight: "600", // Peso normal
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
  contenedorBotones: {
    display: "flex",
    gap: "15px",
    marginTop: "10px",
    alignItems: "center",
  },
  btnIcono: {
    background: "none",
    border: "none",
    padding: "5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "transform 0.2s ease", // Feedback visual
  },
};