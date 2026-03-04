const CONFIG_ESTILOS = {
  maleza: { tx: "#B95000", dot: "#FFD5A1" },
  medicinal: { tx: "#2E7D32", dot: "#A5D6A7" },
  sagrada: { tx: "#7B1FA2", dot: "#CE93D8" },
  toxica: { tx: "#C62828", dot: "#EF9A9A" },
  reserva: { tx: "#1565C0", dot: "#90CAF9" },
  default: { tx: "#616161", dot: "#E0E0E0" },
};

export const InfoEtiquetas = ({ listaEtiquetasBotanicas = [] }) => {
  if (!listaEtiquetasBotanicas || listaEtiquetasBotanicas.length === 0)
    return null;

  return (
    <div style={styles.contenedorSimple}>
      {listaEtiquetasBotanicas.map((texto, index) => {
        const clave = texto
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        const estilo = CONFIG_ESTILOS[clave] || CONFIG_ESTILOS.default;

        return (
          <div key={index} style={styles.tagSimple}>
            <div style={{ ...styles.dotSmall, backgroundColor: estilo.dot }} />
            <span style={{ ...styles.textoSimple, color: estilo.tx }}>
              {texto.toUpperCase()}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  contenedorSimple: {
    display: "flex",
    flexWrap: "wrap",
    gap: "15px", // Espacio generoso entre etiquetas
    margin: "12px 0",
    padding: "0 5px", // Pequeño margen interno
  },
  tagSimple: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  dotSmall: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  textoSimple: {
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "0.5px",
    lineHeight: "1",
  },
};
