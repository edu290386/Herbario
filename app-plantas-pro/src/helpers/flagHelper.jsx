import React from "react";
import { TbWorld } from "react-icons/tb";
import { GiAfrica } from "react-icons/gi";

export const renderBandera = (codigoPais, size = 20) => {
  // Normalizamos el código para que no falle si viene "WORLD" o "world"
  const code = codigoPais?.toLowerCase();

  if (code === "world") {
    return <TbWorld size={size} color="#64748b" style={{ flexShrink: 0 }} />;
  }

  if (code === "yoruba") {
    return <GiAfrica size={size} color="#8d6e63" style={{ flexShrink: 0 }} />;
  }

  // Si no es especial, renderizamos la bandera de FlagCDN
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      width={size}
      style={{
        borderRadius: "2px",
        objectFit: "cover",
        display: "block",
        flexShrink: 0,
      }}
      alt={codigoPais}
      onError={(e) => {
        // Si la bandera falla, ocultamos la imagen rota
        e.target.style.display = "none";
      }}
    />
  );
};
