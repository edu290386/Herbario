import { useState } from "react";
import { TbCloverFilled, TbZoomIn } from "react-icons/tb";
import { transformarImagen } from "../../helpers/cloudinaryHelper";
import fondoRespaldo from "../../assets/fondo.jpg";

export const ImagenVisor = ({ url, onZoomClick, esZoom = false }) => {
  // Nace en true. Como el componente padre le pasa un "key" nuevo al cambiar de foto,
  // este estado se reinicia automáticamente sin necesidad de useEffects.
  const [cargando, setCargando] = useState(true);

  const urlOptimizada = url
    ? transformarImagen(url, esZoom ? "detalle_zoom" : "detalle_base")
    : fondoRespaldo;

  return (
    <div className={`visor-container ${esZoom ? "modo-zoom" : "modo-base"}`}>
      {/* EL SPINNER DE FONDO */}
      {cargando && (
        <div className="mini-spinner-overlay">
          <TbCloverFilled className="mini-spinner-icon" />
        </div>
      )}

      {/* LA IMAGEN REAL */}
      <img
        src={urlOptimizada}
        alt="Detalle botánico"
        className="imagen-botanica"
        style={{
          opacity: cargando ? 0 : 1,
          transition: "opacity 0.4s ease-in-out",
        }}
        onLoad={() => setCargando(false)}
        onError={(e) => {
          e.target.src = fondoRespaldo;
          setCargando(false);
        }}
        loading="lazy"
      />

      {/* 🔍 EL BOTÓN DE LUPA */}
      {!esZoom && url && (
        <button
          className="btn-lupa-zoom"
          onClick={(e) => {
            e.stopPropagation();
            if (onZoomClick) onZoomClick();
          }}
          title="Ampliar imagen"
        >
          <TbZoomIn size={24} />
        </button>
      )}
    </div>
  );
};
