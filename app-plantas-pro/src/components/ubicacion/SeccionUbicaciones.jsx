import { CardUbicacion } from "./CardUbicacion";
import { colores } from "../../constants/tema";
import { StatusBanner } from "../ui/StatusBanner";
import { TbReload } from "react-icons/tb";
import { procesarUbicacionesConGPS } from "../../helpers/geoHelper";

export const SeccionUbicaciones = ({
  ubicaciones,
  nombrePlanta,
  isMobile,
  userCoords,
  onEliminar,
  errorGPS,
  refrescarGPS,
  userPhone,
}) => {
 
  const { ubicacionesProcesadas, statusGps, mensajeGps, hayErrorReal } =
    procesarUbicacionesConGPS(ubicaciones, userCoords, errorGPS);

  return (
    <div className="ubicaciones-wrapper">
      {/* HEADER: Título y controles de estado */}
      <div className="header-seccion">
        <h2 className="titulo-seccion">
          Ubicaciones registradas para {nombrePlanta}
        </h2>

        <div className="controles-gps">
          {/* El Banner sigue su lógica interna, pero el CSS lo posiciona */}
          <StatusBanner status={statusGps} message={mensajeGps} />

          {/* Botón de reinicio: Se muestra según la lógica de coordenadas, no de tamaño */}
          {(hayErrorReal || !userCoords) && (
            <button onClick={refrescarGPS} className="btn-reinicio">
              <TbReload size={20} />
              <span>Reiniciar GPS</span>
            </button>
          )}
        </div>
      </div>

      {/* GRID DINÁMICO: 1 col en mobile, 2 en laptop */}
      {/* GRID DE CARDS */}
    <div className="ubicaciones-grid">
      {ubicacionesProcesadas.length > 0 ? (
        ubicacionesProcesadas.map((ubi) => (
          <CardUbicacion
            key={ubi.id}
            ubicacion={ubi}
            distanciaTexto={ubi.distanciaTexto}
            esReal={ubi.esReal}
            isMobile={isMobile} // Se mantiene para lógica interna si es necesario
            onEliminar={onEliminar}
            nombrePlanta={nombrePlanta}
            userPhone={userPhone}
          />
        ))
      ) : (
        <p className="sin-datos-msg">
          Aún no hay ubicaciones para esta planta.
        </p>
      )}
    </div>
  </div>
)
};
