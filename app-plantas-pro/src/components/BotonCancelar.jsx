import React from "react";
import { useNavigate } from "react-router-dom";
import { colores } from "../constants/tema";

export const BotonCancelar = ({ texto = "CANCELAR" }) => {
  const navigate = useNavigate();

  return (
    <button type="button" onClick={() => navigate(-1)} style={estilos.boton}>
      {texto}
    </button>
  );
};

const estilos = {
  boton: {
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
