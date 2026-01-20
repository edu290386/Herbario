import { useState } from "react";

export const AcordeonInformacion = ({ titulo, contenido }) => {
  const [abierto, setAbierto] = useState(false);

  return (
    <div style={styles.accordionContainer}>
      <div style={styles.accordionHeader} onClick={() => setAbierto(!abierto)}>
        <h3 style={styles.subTitle}>{titulo}</h3>
        <span style={styles.arrowIcon}>{abierto ? "▲" : "▼"}</span>
      </div>

      {abierto && <div style={styles.accordionContent}>{contenido}</div>}
    </div>
  );
};

const styles = {
  accordionContainer: {
    borderTop: "1px solid #f0f4f0",
    borderBottom: "1px solid #f0f4f0",
    margin: "10px 0",
  },
  accordionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    padding: "15px 0",
  },
  subTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#333",
    textTransform: "uppercase",
  },
  arrowIcon: {
    color: "#2D5A27",
    fontWeight: "bold",
  },
  accordionContent: {
    paddingBottom: "20px",
  },
};
