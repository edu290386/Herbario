import {
  FaRegCalendarCheck,
  FaUserPlus,
  FaCar,
} from "react-icons/fa";

import { FaHouse, FaCity, FaUserGroup } from "react-icons/fa6";
import { SiWaze, SiWhatsapp } from "react-icons/si";
import { generarRutas } from "../../helpers/linkHelper";
import { BiMapPin } from "react-icons/bi";
import { EtiquetaReciente } from "../ui/EtiquetaReciente";
import { formatearFechaLocal } from "../../helpers/timeHelper";
import { AuthContext } from "../../context/AuthContext";
import { useContext} from "react"
import { abrirWhatsappPlanta } from "../../helpers/contactHelper.js";
import { BotonEliminar } from "../ui/BotonEliminar.jsx";
import { obtenerIdentidad } from "../../helpers/identidadHelper.js";

export const UbicacionInfo = ({
  ubicacion,
  distancia,
  isMobile,
  onEliminar,
  nombrePlanta,
  userPhone,
}) => {
  const {
    ciudad,
    distrito,
    latitud,
    longitud,

    
  } = ubicacion;
  const { google, waze } = generarRutas(latitud, longitud);
  const { user } = useContext(AuthContext);
  console.log(ubicacion)
  const esDueño = user?.id === ubicacion.usuario_id;
  const esAdmin = user?.rol === "Administrador";

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
        <FaHouse
          className="info-icon"
          size={sizes.iconosFila}
          color="#000000"
        />
        <h4
          style={{
            ...styles.distrito,
            fontSize: sizes.fuenteTitulo,
            letterSpacing: isMobile ? "-1.6px" : "normal",
          }}
        >
          {ubicacion.distrito || "Distrito no especificado"}
        </h4>
      </div>

      {/* 2. CIUDAD */}
      <div style={styles.filaSimple}>
        <FaCity className="info-icon" size={sizes.iconosFila} color="#000000" />
        <span style={{ ...styles.ciudadTexto, fontSize: sizes.fuenteTexto }}>
          {ubicacion.ciudad || "Lima, Perú"}
        </span>
      </div>

      {/* 3. DISTANCIA */}
      {distancia && (
        <div style={styles.badgeDistancia}>
          <div style={styles.textoDistancia}>
            <FaCar
              className="info-icon"
              size={isMobile ? 17 : 18}
              color="#000000"
            />
            <span style={{ fontSize: sizes.fuenteTexto }}>{distancia}</span>
          </div>
        </div>
      )}

      {/* 4. CREADOR */}
      <div style={styles.filaSimple}>
        <FaUserPlus
          className="info-icon"
          size={sizes.iconosFila}
          color="#000000"
        />
        <span style={{ ...styles.infoSecundaria, fontSize: sizes.fuenteTexto }}>
          <b style={{ letterSpacing: isMobile ? "-1.6px" : "normal" }}>
            @{obtenerIdentidad(ubicacion.usuarios)}
          </b>
        </span>
      </div>
      {/* 5. GRUPO DE CREADOR */}
      <div style={styles.filaSimple}>
        <FaUserGroup
          className="info-icon"
          size={sizes.iconosFila}
          color="#000000"
        />
        <span style={{ ...styles.infoSecundaria, fontSize: sizes.fuenteTexto }}>
          <b style={{ letterSpacing: isMobile ? "-1.6px" : "normal" }}>
            {ubicacion.usuarios?.grupos?.nombre_grupo ?? "Sin grupo"}
          </b>
        </span>
      </div>
      {/* 6. FECHA */}
      <div style={styles.filaSimple}>
        <FaRegCalendarCheck
          className="info-icon"
          size={sizes.iconosFila}
          color="#000"
        />
        <span style={{ ...styles.fechaTexto, fontSize: sizes.fuenteTexto }}>
          {formatearFechaLocal(ubicacion.created_at)}
          <EtiquetaReciente fechaISO={ubicacion.created_at} />
        </span>
      </div>

      {/* 7. ACCIONES */}
      <div style={styles.acciones}>
        <div style={styles.contenedorNavegacion}>
          <button
            onClick={() => manejarNavegacion(google)}
            style={styles.btnIcono}
          >
            <BiMapPin
              className="action-icon"
              color="#B6452C"
              size={sizes.iconosAccion}
            />
          </button>
          <button
            onClick={() => manejarNavegacion(waze)}
            style={styles.btnIcono}
          >
            <SiWaze
              className="action-icon"
              color="#2A9DF4"
              size={sizes.iconosAccion}
            />
          </button>
          <button
            onClick={() =>
              abrirWhatsappPlanta(
                nombrePlanta || "Planta", // Pasamos el nombre aquí
                distrito,
                ciudad,
                latitud,
                longitud,
                distancia,
                userPhone,
              )
            }
            style={{ ...styles.btnIcono, marginLeft: "4px" }}
          >
            <SiWhatsapp
              className="action-icon"
              size={sizes.iconosAccion}
              color="#25D366"
            />
          </button>
        </div>

        {/* 3. Renderizado condicional: Solo si tiene permiso */}
        {(esDueño || esAdmin) && (
          <div style={styles.contenedorEliminar}>
            <BotonEliminar
              usuarioIdCreador={ubicacion.usuario_id}
              ubiId={ubicacion.id}
              fotoUrl={ubicacion.foto_contexto}
              onEliminar={onEliminar} // Pasa la función del padre directamente
            />
          </div>
        )}
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
    fontWeight: "600",
    color: "#000000",
    margin: 0,
    whiteSpace: "nowrap", // Prohíbe el salto de línea
    overflow: "hidden", // Esconde lo que sobra
    textOverflow: "ellipsis", // Agrega los "..."
    flex: 1,
    minWidth: 0,
  },
  ciudadTexto: {
    color: "#000000",
    fontWeight: "600",
  },
  badgeDistancia: {
    alignSelf: "flex-start",
  },
  textoDistancia: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#000000",
    fontWeight: "600",
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
    marginTop: "auto",
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
