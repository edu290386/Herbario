import React, { useState } from "react";
import { CarruselImagenPrincipal } from "./CarruselImagenPrincipal";
import { CarruselMiniaturas } from "./CarruselMiniaturas";
import { CarruselControles } from "./CarruselControles";

export const CarruselDetalle = ({ imagenes, isMobile }) => {
  const [indice, setIndice] = useState(0);

  const siguiente = () =>
    setIndice((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  const anterior = () =>
    setIndice((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));

  return (
    <div style={styles.container}>
      <div style={styles.mainWrapper}>
        <CarruselImagenPrincipal url={imagenes[indice]} isMobile={isMobile} />

        {imagenes.length > 1 && (
          <CarruselControles onNext={siguiente} onPrev={anterior} />
        )}
      </div>

      {!isMobile && (
        <CarruselMiniaturas
          imagenes={imagenes}
          indiceActivo={indice}
          setIndiceActivo={setIndice}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    maxWidth: "710px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "35px",
  },
  mainWrapper: { position: "relative", width: "100%", overflow: "hidden" },
};
