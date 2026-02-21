import {
  FaRegCalendarCheck,
  FaUserPlus,
  FaCar,
  FaSatellite,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { FaHouse, FaCity, FaUserGroup } from "react-icons/fa6";
import { SiWaze, SiWhatsapp } from "react-icons/si";
import { BiMapPin } from "react-icons/bi";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { generarRutas } from "../../helpers/linkHelper";
import { formatearFechaLocal } from "../../helpers/timeHelper";
import { abrirWhatsappPlanta } from "../../helpers/contactHelper.js";
import { obtenerIdentidad } from "../../helpers/identidadHelper.js";
import { EtiquetaReciente } from "../ui/EtiquetaReciente";
import { BotonEliminar } from "../ui/BotonEliminar.jsx";

export const UbicacionInfo = ({
  ubicacion,
  distancia,
  esReal,
  onEliminar,
  nombrePlanta,
  userPhone,
}) => {
  const { ciudad, distrito, latitud, longitud } = ubicacion;
  const { google, waze } = generarRutas(latitud, longitud);
  const { user } = useContext(AuthContext);

  const esDueño = user?.id === ubicacion.usuario_id;
  const esAdmin = user?.rol === "Administrador";


  const manejarNavegacion = (url) => {
    const esPantallaPequeña = window.innerWidth <= 768;
    if (esPantallaPequeña) {
      window.location.href = url;
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <div style={styles.contenedor}>
      {/* 1. DISTRITO */}
      <div style={styles.filaSimple}>
        <FaHouse size={16} color="#000" />
        <span
          style={{
            ...styles.textoFila,
            fontWeight: "700",
            fontSize: "0.75rem",
          }}
        >
          {distrito || "Sin Distrito"}
        </span>
      </div>

      {/* 2. CIUDAD */}
      <div style={styles.filaSimple}>
        <FaCity size={16} color="#000" />
        <span style={{ ...styles.textoFila, fontSize: "0.75rem" }}>
          {ciudad || "Lima, Perú"}
        </span>
      </div>

      {/* 3. DISTANCIA / SEÑAL */}
      <div style={styles.filaSimple}>
        {distancia && esReal ? (
          /* CASO 1: ÉXITO - Tenemos distancia real */
          <>
            <FaCar size={16} color="#2e7d32" />
            <span
              style={{
                ...styles.textoFila,
                color: "#2e7d32",
                fontWeight: "700",
                fontSize: "0.75rem",
              }}
            >
              {distancia}
            </span>
          </>
        ) : !esReal && distancia ? (
          /* CASO 2: SEÑAL DÉBIL - Hay distancia pero no es precisa */
          <>
            <FaSatellite size={16} color="#D32F2F" />
            <span
              style={{
                ...styles.textoFila,
                color: "#D32F2F",
                fontWeight: "700",
                fontSize: "0.7rem",
              }}
            >
              SEÑAL DÉBIL
            </span>
          </>
        ) : (
          /* CASO 3: EL NUEVO ESTADO - Esperando por el sensor GPS */
          <>
            <FaMapMarkerAlt size={16} color="#ffa000" />{" "}
            {/* Icono de pin en naranja */}
            <span
              style={{
                ...styles.textoFila,
                color: "#ffa000",
                fontWeight: "700",
                fontSize: "0.7rem",
              }}
            >
              Esperando coordenadas ...
            </span>
          </>
        )}
      </div>

      {/* 4. CREADOR */}
      <div style={styles.filaSimple}>
        <FaUserPlus size={16} color="#000" />
        <span
          style={{
            ...styles.textoFila,
            fontSize: "0.75rem",
            fontStyle: "italic",
          }}
        >
          @{obtenerIdentidad(ubicacion.usuarios)}
        </span>
      </div>

      {/* 5. GRUPO */}
      <div style={styles.filaSimple}>
        <FaUserGroup size={16} color="#000" />
        <span style={{ ...styles.textoFila, fontSize: "0.75rem" }}>
          {ubicacion.usuarios?.grupos?.nombre_grupo ?? "Sin grupo"}
        </span>
      </div>

      {/* 6. FECHA */}
      <div style={styles.filaSimple}>
        <FaRegCalendarCheck size={16} color="#000" />
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span
            style={{ ...styles.textoFila, fontSize: "0.75rem", color: "#666" }}
          >
            {formatearFechaLocal(ubicacion.created_at)}
          </span>
          <EtiquetaReciente fechaISO={ubicacion.created_at} />
        </div>
      </div>

      {/* 7. ACCIONES (Bloque Único) */}
      <div style={styles.acciones}>
        <div style={styles.grupoAccionesUnico}>
          <button
            onClick={() => manejarNavegacion(google)}
            style={styles.btnAction}
          >
            <BiMapPin color="#B6452C" size={22} />
          </button>

          <button
            onClick={() => manejarNavegacion(waze)}
            style={styles.btnAction}
          >
            <SiWaze color="#2A9DF4" size={22} />
          </button>

          <button
            onClick={() =>
              abrirWhatsappPlanta(
                nombrePlanta,
                distrito,
                ciudad,
                latitud,
                longitud,
                esReal ? distancia : null,
                userPhone,
              )
            }
            style={styles.btnAction}
          >
            <SiWhatsapp color="#25D366" size={22} />
          </button>

          {/* Botón eliminar integrado sin llaves extras */}
          {(esDueño || esAdmin) && (
            <div style={styles.btnAction}>
              <BotonEliminar
                usuarioIdCreador={ubicacion.usuario_id}
                ubiId={ubicacion.id}
                fotoUrl={ubicacion.foto_contexto}
                onEliminar={onEliminar}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  contenedor: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
    padding: "2px 0",
    minWidth: 0,
  },
  filaSimple: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    height: "24px",
  },
  textoFila: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1,
  },
  acciones: {
    marginTop: "auto",
    paddingTop: "8px",
    borderTop: "1px solid #f0f0f0",
  },
  grupoAccionesUnico: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },
  btnAction: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
};
