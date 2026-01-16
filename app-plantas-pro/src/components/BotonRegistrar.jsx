import React from "react";
import { MapPin } from "lucide-react";
import { colores } from "../constants/tema";

export const BotonRegistrar = ({ onClick, disabled, texto = "Registrar nueva planta" }) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled} 
      style={estilos.btn}>
      <MapPin size={18} />
      <span>{texto}</span>
    </button>
  );
};

const estilos = {
  btn: {
    backgroundColor: colores.retama,
    color: colores.bosque,
    border: `2px solid ${colores.bosque}`,
    padding: "15px",
    borderRadius: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "15px",
    fontSize: "0.9rem",
    letterSpacing: "1px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    textTransform: "uppercase",
  },
};
