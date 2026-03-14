import { useState } from "react";
import { CardUbicacion } from "./CardUbicacion";
import { StatusBanner } from "../ui/StatusBanner";
import "./Ubicaciones.css"
import { procesarUbicacionesConGPS } from "../../helpers/geoHelper";
import { BotonPrincipal } from "../ui/BotonPrincipal";
import { ModalZoom } from "../planta/ModalZoom";

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
  
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

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
              // 2. Pasamos la función al Card
              onImageClick={(url) => setFotoAmpliada(url)}
            />
          ))
        ) : (
          <p className="sin-datos-msg">Aún no hay ubicaciones.</p>
        )}
      </div>

      {/* 3. Renderizamos el ModalZoom reutilizando tu componente */}
      {fotoAmpliada && (
        <ModalZoom url={fotoAmpliada} onClose={() => setFotoAmpliada(null)} />
      )}
    </div>
  );
};
