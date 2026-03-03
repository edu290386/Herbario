import { useState } from "react";
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";
import { ImagenVisor } from "./ImagenVisor";
import { ModalZoom } from "./ModalZoom";
import { BotonVolver } from "../ui/BotonVolver";

export const CarruselPrincipal = ({ imagenes }) => {
  // Nace en 0 automáticamente cada vez que cambiamos de categoría
  // gracias al prop "key" que le pasamos desde DetallePage. ¡Cero useEffects!
  const [indice, setIndice] = useState(0);
  const [mostrarZoom, setMostrarZoom] = useState(false);

  if (!imagenes || imagenes.length === 0) {
    return (
      <div className="carrusel-principal-wrapper">
        <div className="btn-volver-flotante">
          <BotonVolver />
        </div>
        <ImagenVisor url={null} />
      </div>
    );
  }

  const imagenActual = imagenes[indice];
  const hayMultiples = imagenes.length > 1;

  const siguiente = (e) => {
    e.stopPropagation();
    setIndice((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  const anterior = (e) => {
    e.stopPropagation();
    setIndice((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  return (
    <>
      <div className="carrusel-principal-wrapper">
        {/* BOTÓN VOLVER */}
        <div className="btn-volver-flotante">
          <BotonVolver />
        </div>

        {/* VISOR PRINCIPAL (Reinicia su spinner gracias al 'key') */}
        <ImagenVisor
          key={imagenActual}
          url={imagenActual}
          onZoomClick={() => setMostrarZoom(true)}
        />

        {/* CONTROLES DE NAVEGACIÓN */}
        {hayMultiples && (
          <>
            <button className="btn-nav prev" onClick={anterior}>
              <TbChevronLeft size={24} />
            </button>
            <button className="btn-nav next" onClick={siguiente}>
              <TbChevronRight size={24} />
            </button>
          </>
        )}

        {/* 🏷️ ETIQUETA NEGRA (Siempre visible) */}
        <div className="indicador-posicion">
          {indice + 1} / {imagenes.length}
        </div>
      </div>

      {/* MODAL ZOOM */}
      {mostrarZoom && (
        <ModalZoom url={imagenActual} onClose={() => setMostrarZoom(false)} />
      )}
    </>
  );
};
