import { useState } from "react";
import { CarruselImagenPrincipal } from "./CarruselImagenPrincipal";
import { CarruselControles } from "./CarruselControles";
import "./Carrusel.css";

export const CarruselDetalle = ({ imagenes }) => {
  const [indice, setIndice] = useState(0);

  const siguiente = () =>
    setIndice((p) => (p === imagenes.length - 1 ? 0 : p + 1));
  const anterior = () =>
    setIndice((p) => (p === 0 ? imagenes.length - 1 : p - 1));

  return (
    <div className="carrusel-detalle-container">
      <div style={{ position: "relative" }}>
        <CarruselImagenPrincipal url={imagenes[indice]} />
        {imagenes.length > 1 && (
          <CarruselControles onNext={siguiente} onPrev={anterior} />
        )}
      </div>
    </div>
  );
};