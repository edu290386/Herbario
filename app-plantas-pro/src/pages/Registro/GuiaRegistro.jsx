import React from "react";
import {
  PiPlantFill,
  PiGlobeHemisphereWestFill,
  PiCameraFill,
  PiMapPinFill,
} from "react-icons/pi";
import { TbWorld } from "react-icons/tb";

export const GuiaRegistro = ({ flujo }) => {
  // Contenido dinámico según el texto que recibe
  const configuracion = {
    "nueva planta": {
      bg: "#fff9db",
      border: "#fcc419",
      icon: <TbWorld size={24} color="#856404" />,
      titulo: "Guía: Registro Inicial",
      pasos: [
        <>
          Si en tu país se llama{" "}
          <strong style={{ color: "#e67e22" }}>Palta</strong>, pon el nombre y
          selecciona <strong>Perú</strong>.
        </>,
        "Si es un nombre general, usa 'Mundial (world)'.",
        "Si es una planta especial, recuerda usar el término 'Sacred'.",
      ],
    },
    "solo ubicacion": {
      bg: "#e7f5ff",
      border: "#339af0",
      icon: <PiMapPinFill size={24} color="#1864ab" />,
      titulo: "Guía: Nueva Ubicación",
      pasos: [
        "Toca el icono de la cámara para capturar la planta en su sitio.",
        "Verifica que ambos checks (Foto y GPS) estén en verde.",
        "Asegúrate de tener buena señal para obtener el distrito/ciudad.",
      ],
    },
    "agregar detalle": {
      bg: "#f3f0ff",
      border: "#845ef7",
      icon: <PiPlantFill size={24} color="#5f3dc4" />,
      titulo: "Guía: Enriquecer Ficha",
      pasos: [
        "Puedes añadir un nombre secundario con su país respectivo.",
        "Sube una foto de alta calidad para el carrusel principal.",
        "Esta información ayudará a otros a identificar la especie.",
      ],
    },
  };

  const info = configuracion[flujo];
  if (!info) return null;

  return (
    <div
      className="guia-container"
      style={{
        backgroundColor: info.bg,
        borderLeft: `5px solid ${info.border}`,
      }}
    >
      <div className="guia-header">
        {info.icon}
        <span className="guia-titulo">{info.titulo}</span>
      </div>
      <ul className="guia-lista">
        {info.pasos.map((paso, index) => (
          <li key={index} className="guia-item">
            {paso}
          </li>
        ))}
      </ul>

      {/* Detalle visual de la plantita Sacred si aplica */}
      {flujo !== "solo ubicacion" && (
        <div className="sacred-hint">
          <PiPlantFill className="sacred-leaf" />
          <small>Usa "Sacred" para plantas sagradas.</small>
        </div>
      )}
    </div>
  );
};
