import { CardUbicacion } from "./CardUbicacion";
import { StatusBanner } from "../ui/StatusBanner";
import "./Ubicaciones.css"
import { procesarUbicacionesConGPS } from "../../helpers/geoHelper";
import { BotonPrincipal } from "../ui/BotonPrincipal";

export const SeccionUbicaciones = ({
  ubicaciones,
  nombrePlanta,
  userCoords,
  onEliminar,
  errorGPS,
  cargandoGPS,
  refrescarGPS,
  userPhone,
}) => {
  
  const { ubicacionesProcesadas, statusGps, mensajeGps, hayErrorReal } =
    procesarUbicacionesConGPS(ubicaciones, userCoords, errorGPS);

  return (
    <div className="ubicaciones-wrapper">
      <div className="header-seccion">
        <h2 className="titulo-seccion">Ubicaciones para {nombrePlanta}</h2>

        <div className="controles-gps">
          <StatusBanner status={statusGps} message={mensajeGps} />

          {!cargandoGPS && (hayErrorReal || !userCoords) && (
            <BotonPrincipal
              onClick={refrescarGPS}
              texto="REINICIAR GPS"
              textoCargando="BUSCANDO SEÑAL..."
              estaCargando={cargandoGPS}
            />
          )}
        </div>
      </div>

      <div className="ubicaciones-grid">
        {ubicacionesProcesadas.length > 0 ? (
          ubicacionesProcesadas.map((ubi) => (
            <CardUbicacion
              key={ubi.id}
              ubicacion={ubi}
              distanciaTexto={ubi.distanciaTexto}
              esReal={ubi.esReal}
              onEliminar={onEliminar}
              nombrePlanta={nombrePlanta}
              userPhone={userPhone}
            />
          ))
        ) : (
          <p className="sin-datos-msg">Aún no hay ubicaciones.</p>
        )}
      </div>
    </div>
  );
};
