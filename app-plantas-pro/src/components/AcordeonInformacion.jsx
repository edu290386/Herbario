import React, { useState } from "react";
import { colores } from "../constants/tema";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

export const AcordeonInformacion = ({ titulo, contenido }) => {
  const [abierto, setAbierto] = useState(false);

  return (
    <div style={styles.accordionContainer}>
      <div style={styles.accordionHeader} onClick={() => setAbierto(!abierto)}>
        <span style={styles.subTitle}>{titulo}</span>

        {/* Usamos los iconos de React Icons */}
        <div style={styles.iconWrapper}>
          {abierto ? (
            <IoIosArrowUp size={20} color={colores.bosque}/>
          ) : (
            <IoIosArrowDown size={20} color={colores.bosque} />
          )}
        </div>
      </div>

      {abierto && <div style={styles.accordionContent}>{contenido}</div>}
    </div>
  );
};

const styles = {
  accordionContainer: {
    borderBottom: "1px solid #f0f4f0",
  },
  accordionHeader: {
    display: "flex",
    justifyContent: "space-between", // Mantiene el título a la izquierda y flecha a la derecha
    alignItems: "center",
    cursor: "pointer",
    padding: "20px 0",
  },
  subTitle: {
    fontSize: "0.90rem",
    fontWeight: "600",
    color: colores.bosque,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    transition: "transform 0.3s ease",
    padding: "5px 0px 0px 0px",
  },
  accordionContent: {
    paddingTop: "0px",
    paddingBottom: "15px",
    lineHeight: "1.4",
    color: colores.bosque,
    fontSize: "0.95rem",
    animation: "fadeIn 0.3s ease",
    textAlign: "justify",
  },
  textoInterno: {
    fontSize: "0.88rem", 
    color: "#666",
    margin: 0,
  },
};