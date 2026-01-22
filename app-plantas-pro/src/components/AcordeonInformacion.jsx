import React, { useState } from "react";
import { colores } from "../constants/tema.js";

export const AcordeonInformacion = ({ titulo, contenido }) => {
  const [estaAbierto, setEstaAbierto] = useState(false);

  const toggleAcordeon = () => {
    setEstaAbierto(!estaAbierto);
  };

  return (
    <div style={styles.contenedor}>
      <button onClick={toggleAcordeon} style={styles.boton}>
        <span style={styles.titulo}>{titulo}</span>
        <span style={styles.flecha}>{estaAbierto ? "▲" : "▼"}</span>
      </button>
      {estaAbierto && contenido && (
        <div style={styles.contenido}>{contenido}</div>
      )}
    </div>
  );
};

const styles = {
  contenedor: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: "12px",
    marginBottom: "10px",
    border: "1px solid #eee",
    overflow: "hidden",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
  boton: {
    width: "100%",
    padding: "15px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  titulo: {
    color: colores.bosque || "#2d5a27",
    fontSize: "1rem",
    fontWeight: "700",
  },
  flecha: {
    color: "#666",
    fontSize: "0.8rem",
  },
  contenido: {
    padding: "0 20px 20px 20px",
    fontSize: "0.9rem",
    color: "#444",
    lineHeight: "1.6",
    borderTop: "1px solid #f9f9f9",
  },
};