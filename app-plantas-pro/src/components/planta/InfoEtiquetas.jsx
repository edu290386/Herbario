
const CONFIG_ESTILOS = {
  maleza: { bg: "#FFF4E5", tx: "#B95000", border: "#FFD5A1" },
  medicinal: { bg: "#E8F5E9", tx: "#2E7D32", border: "#A5D6A7" },
  sagrada: { bg: "#F3E5F5", tx: "#7B1FA2", border: "#CE93D8" },
  toxica: { bg: "#FFEBEE", tx: "#C62828", border: "#EF9A9A" },
  reserva: { bg: "#E3F2FD", tx: "#1565C0", border: "#90CAF9" },
  default: { bg: "#F5F5F5", tx: "#616161", border: "#E0E0E0" },
};

export const InfoEtiquetas = ({ listaEtiquetasBotanicas = [] }) => {
  if (!listaEtiquetasBotanicas || listaEtiquetasBotanicas.length === 0)
    return null;

  return (
    <div style={styles.contenedor}>
      {listaEtiquetasBotanicas.map((texto, index) => {
        const clave = texto
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        const estilo = CONFIG_ESTILOS[clave] || CONFIG_ESTILOS.default;

        return (
          <div
            key={index}
            style={{
              ...styles.tag,
              backgroundColor: estilo.bg,
              color: estilo.tx,
              borderColor: estilo.border,
            }}
          >
            {texto.toUpperCase()}
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  contenedor: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px", // Espacio reducido entre etiquetas
    margin: "12px 0",
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "3px 10px", // Padding ultra-ajustado: 2px arriba/abajo, 8px lados
    borderRadius: "20px", // Radio más sutil para que se vea más "exacto"
    fontSize: "10px", // Fuente un pelín más pequeña para precisión
    fontWeight: "900",
    whiteSpace: "nowrap", // Evita que la palabra se rompa
    border: "1px solid",
    lineHeight: "1.4", // Altura de línea ajustada al texto
  },
};
