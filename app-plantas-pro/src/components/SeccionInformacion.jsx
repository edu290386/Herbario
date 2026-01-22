import React from "react";
import { AcordeonInformacion } from "./AcordeonInformacion.jsx";
import { colores } from "../constants/tema.js";

export const SeccionInformacion = ({ planta }) => {
  // Si no hay planta, no renderizamos nada
  if (!planta) return null;

  return (
    <section style={styles.contenedorSeccion}>
      <AcordeonInformacion
        titulo="Propiedades Medicinales"
        contenido={<p style={styles.textInterno}>{planta.acordeon1}</p>}
      />

      <AcordeonInformacion
        titulo="Preparación y Uso"
        contenido={<p style={styles.textInterno}>{planta.acordeon2}</p>}
      />

      <AcordeonInformacion
        titulo="Links externos"
        contenido={<p style={styles.textInterno}>{planta.acordeon3}</p>}
      />


    </section>
  );
};

// ESTILOS AL FINAL
const styles = {
  contenedorSeccion: {
    display: "flex",
    flexDirection: "column",
    gap: "5px", // Espacio mínimo entre acordeones
    padding: "10px",
    width: "100%",
  },
  textInterno: {
    margin: 0,
    color: "#444",
    lineHeight: "1.6",
    textAlign: "justify",
  },
};
