import React from "react";
import { UbicacionInfo } from "./UbicacionInfo.jsx";
import "./Ubicaciones.css";

export const CardUbicacion = ({
  ubicacion,
  nombrePlanta,
  
  distanciaTexto,
  esReal,
  onEliminar,
  userPhone,
}) => {
  const urlImagen = ubicacion.foto_contexto;

  return (
    <div className="card-ubicacion-base">
      <div
        className={`foto-contexto ${!urlImagen ? "sin-foto" : ""}`}
        style={{
          // Si no hay urlImagen, no ponemos la propiedad backgroundImage
          backgroundImage: urlImagen ? `url("${urlImagen}")` : "none",
          backgroundColor: urlImagen ? "transparent" : "#e0e0e0", // Color gris neutro si no hay foto
        }}
      >
        {!urlImagen && <span className="placeholder-text">Sin Foto</span>}
      </div>

      <div className="info-contenedor">
        <UbicacionInfo
          ubicacion={ubicacion}
          distancia={distanciaTexto}
          esReal={esReal}
          onEliminar={onEliminar}
          nombrePlanta={nombrePlanta}
          userPhone={userPhone}
        />
      </div>
    </div>
  );
};