import React from "react";
import { renderBandera } from "../../helpers/flagHelper";
import { FaCheckCircle } from "react-icons/fa";

export const NombreOficialRow = ({ nombre, pais, esPreview = false }) => {
  // 1. Estilos del contenedor principal (Actualizado)
  const rowStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px", // Unimos un poco más el gap global si es preview
    borderBottom: "1px solid rgba(0,0,0,0.03)",
    // Estilos de "carpeta glass" solo para el Registro
    ...(esPreview && {
      backgroundColor: "var(--color-gris-suave)",
      padding: "10px 16px 10px 16px",
      borderRadius: "16px",
      border: "1px solid var(--color-gris-borde)",
      backdropFilter: "blur(10px)",
      width: "fit-content", // Se ajusta al contenido
      marginTop: "10px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
    }),
  };

  // 2. Estilos del identificador de país (Ajuste clave aquí)
  const paisIdentificador = {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    // CAMBIO: Si es preview, quitamos el minWidth para que el nombre se pegue
    minWidth: esPreview ? "auto" : "60px",
  };

  const siglaPais = {
    fontSize: "12px",
    fontWeight: "900",
    color: "#666",
  };

  const itemNombre = {
    display: "flex",
    alignItems: "center",
    gap: "5px", // Espacio entre texto y check
  };

  const textoNombre = {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1a1a1a",
    textTransform: "uppercase",
  };

  return (
    <div style={rowStyle}>
      <div style={paisIdentificador}>
        {renderBandera(pais)}
        <span style={siglaPais}>{pais.toUpperCase()}:</span>
      </div>

      <div style={itemNombre}>
        <span style={textoNombre}>{nombre}</span>
        <FaCheckCircle size={10} color="#2d8b57" />
      </div>
    </div>
  );
};
