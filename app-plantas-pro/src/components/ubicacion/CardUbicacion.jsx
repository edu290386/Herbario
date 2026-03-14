import React from "react";
import { UbicacionInfo } from "./UbicacionInfo.jsx";
import "./Ubicaciones.css";
import { TbZoomIn } from "react-icons/tb";

export const CardUbicacion = ({
  ubicacion,
  nombrePlanta,
  distanciaTexto,
  esReal,
  onEliminar,
  userPhone,
  onImageClick,
}) => {
  const urlImagen = ubicacion.foto_contexto;

  return (
    <div className="card-ubicacion-base">
      <div
        className={`foto-contexto ${urlImagen ? "foto-clickeable" : "sin-foto"}`}
        style={{
          backgroundImage: urlImagen ? `url("${urlImagen}")` : "none",
          backgroundColor: urlImagen ? "transparent" : "#e0e0e0",
        }}
        onClick={() => {
          if (urlImagen && onImageClick) {
            onImageClick(urlImagen);
          }
        }}
      >
        {/* 2. SI HAY FOTO: Mostramos el overlay con la lupa */}
        {urlImagen && (
          <div className="overlay-lupa-card">
            <TbZoomIn size={24} color="#fff" />
          </div>
        )}

        {/* SI NO HAY FOTO: Mostramos el texto */}
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