import React from "react";
import { colores } from "../constants/tema";
import { OtrosNombres } from "./OtrosNombres";

export const BloqueIdentidad = ({ planta }) => {
  return (
    <div style={estilos.bloque}>
      {/* Nombre Común */}
      <h1 style={estilos.nombreComun}>{planta.nombre_comun}</h1>

      {/* Nombre Científico */}
      <p style={estilos.nombreCientifico}>
        <i>{planta.nombre_cientifico || "Nombre científico pendiente"}</i>
      </p>

      {/* Otros Nombres */}
      <div style={estilos.contenedorOtros}>
        {planta.nombres_secundarios?.length > 0 ? (
          <OtrosNombres lista={planta.nombres_secundarios} />
        ) : (
          <span style={estilos.textoVacio}>
            Sin nombres adicionales registrados
          </span>
        )}
      </div>
    </div>
  );
};

const estilos = {
  bloque: {
    backgroundColor: "white", // Mantenemos tu color de fondo
    width: "100%", // Ahora ocupa el mismo ancho que los acordeones
    margin: "0 auto 25px auto", // Centrado y con margen inferior
    padding: "20px",
    borderRadius: "15px",
    boxSizing: "border-box",
    minHeight: "160px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",

    // EFECTO DE LA OPCIÓN 3: Sombreado suave y profundo
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",

    // Opcional: Un borde muy sutil para definirlo mejor
    border: "1px solid rgba(0,0,0,0.03)",
  },
  nombreComun: {
    margin: 0,
    fontSize: "1.8rem",
    color: colores.bosque,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  nombreCientifico: {
    margin: "5px 0 15px 0",
    fontSize: "1.1rem",
    color: "#666",
  },
  contenedorOtros: {
    marginTop: "5px",
  },
  textoVacio: {
    fontSize: "0.85rem",
    color: "#bbb",
    fontStyle: "italic",
  },
};
