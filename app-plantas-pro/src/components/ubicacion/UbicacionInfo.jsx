import {
  FaRegCalendarCheck,
  FaUserPlus,
  FaCar,
  FaSatellite,
  FaMapMarkerAlt,
  FaExclamationTriangle,
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
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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

  const handleReportar = () => {
    navigate("/aportes", {
      state: {
        flujo: "reporte_ubicacion",
        plantaId: ubicacion.planta_id,
        nombrePlanta: nombrePlanta,
        ubicacionRef: ubicacion.id,
        distritoRef: distrito,
      },
    });
  };

  return (
    <div className="info-detalle-contenedor">
      {/* 1. DISTRITO */}
      <div className="item-fila">
        <FaHouse size={16} color="#000" />
        <span className="texto-fila-fuerte">{distrito || "Sin Distrito"}</span>
      </div>

      {/* 2. CIUDAD */}
      <div className="item-fila">
        <FaCity size={16} color="#000" />
        <span className="texto-fila">{ciudad || "Lima, Perú"}</span>
      </div>

      {/* 3. DISTANCIA / SEÑAL */}
      <div className="item-fila">
        {distancia && esReal ? (
          <>
            <FaCar size={16} color="#2e7d32" />
            <span className="texto-fila-exito">{distancia}</span>
          </>
        ) : !esReal && distancia ? (
          <>
            <FaSatellite size={16} color="#D32F2F" />
            <span className="texto-fila-error">SEÑAL DÉBIL</span>
          </>
        ) : (
          <>
            <FaMapMarkerAlt size={16} color="#ffa000" />
            <span className="texto-fila-alerta">Esperando coordenadas ...</span>
          </>
        )}
      </div>

      {/* 4. CREADOR */}
      <div className="item-fila">
        <FaUserPlus size={16} color="#000" />
        <span className="texto-fila-italica">
          @{obtenerIdentidad(ubicacion.usuarios)}
        </span>
      </div>

      {/* 5. GRUPO */}
      <div className="item-fila">
        <FaUserGroup size={16} color="#000" />
        <span className="texto-fila">
          {ubicacion.usuarios?.grupos?.nombre_grupo ?? "Sin grupo"}
        </span>
      </div>

      {/* 6. FECHA */}
      <div className="item-fila">
        <FaRegCalendarCheck size={16} color="#000" />
        <div className="contenedor-fecha">
          <span className="texto-fila-gris">
            {formatearFechaLocal(ubicacion.created_at)}
          </span>
          <EtiquetaReciente fechaISO={ubicacion.created_at} />
        </div>
      </div>

      {/* 7. ACCIONES (Bloque Único) */}
      <div className="botones-navegacion">
        <div className="grupo-acciones-unico">
          <button
            onClick={() => manejarNavegacion(google)}
            className="btn-action-icono"
          >
            <BiMapPin color="#B6452C" size={22} />
          </button>

          <button
            onClick={() => manejarNavegacion(waze)}
            className="btn-action-icono"
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
            className="btn-action-icono"
          >
            <SiWhatsapp color="#25D366" size={22} />
          </button>

          {esDueño || esAdmin ? (
            <div className="btn-action-icono">
              <BotonEliminar
                ubicacion={ubicacion}
                nombrePlanta={nombrePlanta}
                onEliminar={onEliminar}
              />
            </div>
          ) : (
            <button
              onClick={handleReportar}
              className="btn-action-icono"
              title="Reportar ubicación errónea"
            >
              <FaExclamationTriangle color="#f57c00" size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
