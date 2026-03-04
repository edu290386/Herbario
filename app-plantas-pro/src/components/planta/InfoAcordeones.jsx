import { useState } from "react";
import { TbChevronDown, TbChevronUp } from "react-icons/tb";
import { colores } from "../../constants/tema";

export const InfoAcordeones = ({ secciones = [] }) => {
  const [abierto, setAbierto] = useState(0); // Por defecto el primero abierto

  if (!secciones || secciones.length === 0) return null;

  return (
    <div style={styles.wrapper}>
      {secciones.map((sec, i) => (
        <div key={i} style={styles.item}>
          <button
            style={{
              ...styles.header,
              borderBottom: abierto === i ? "1px solid #eee" : "none",
            }}
            onClick={() => setAbierto(abierto === i ? -1 : i)}
          >
            <span style={styles.titulo}>{sec.titulo}</span>
            {abierto === i ? (
              <TbChevronUp color={colores.frondoso} />
            ) : (
              <TbChevronDown color="#999" />
            )}
          </button>

          {abierto === i && (
            <div style={styles.contenido}>
              <p style={styles.texto}>{sec.contenido}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const styles = {
  wrapper: {
    marginTop: "25px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  item: {
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #eee",
  },
  header: {
    width: "100%",
    padding: "15px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  titulo: { fontWeight: "bold", color: colores.bosque, fontSize: "15px" },
  contenido: {
    padding: "15px 20px",
    backgroundColor: "#fdfdfd",
    animation: "fadeIn 0.3s ease",
  },
  texto: {
    fontSize: "14.5px",
    color: "#444",
    lineHeight: "1.6",
    margin: 0,
    whiteSpace: "pre-line",
  },
};
