import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { TbLeaf, TbMapPinFilled, TbCalendar } from "react-icons/tb";

export const RegistroLog = ({ log }) => {
  const esNuevaPlanta = log.tipo_accion === "nueva_planta";

  // PALETAS DE ALTO CONTRASTE
  const estilo = esNuevaPlanta
    ? {
        back: "#E8E8E1", // Verde menta muy suave (elegante, no cansa la vista)
        titulo: "#163020", // Verde bosque profundo
        sub: "#527853", // Verde oliva para alias y fecha
        iconCirc: "#e2ede7",
        badgeBack: "#163020", // Badge oscuro (Cámbialo a #FF0000 para probar si gustas)
        badgeText: "#ffffff", // Texto blanco
        status: "#d97706",
      }
    : {
        back: "#ffffff",
        titulo: "#2f4538",
        sub: "#64748b",
        iconCirc: "#f0fdf4",
        badgeBack: "#f1f5f9",
        badgeText: "#475569",
        status: "#2d8b57",
      };

  return (
    <div
      style={{
        ...styles.card,
        backgroundColor: estilo.back,
      }}
    >
      {/* 1. SECCIÓN SUPERIOR */}
      <div style={styles.filaPrincipal}>
        <div style={styles.infoPlantaContenedor}>
          <div
            style={{ ...styles.circuloIcono, backgroundColor: estilo.iconCirc }}
          >
            {esNuevaPlanta ? (
              <TbLeaf size={16} color={estilo.titulo} />
            ) : (
              <TbMapPinFilled size={16} color={estilo.status} />
            )}
          </div>
          <h3 style={{ ...styles.nombrePlanta, color: estilo.titulo }}>
            {log.nombre_planta || "REGISTRO BOTÁNICO"}
          </h3>
        </div>

        <div style={styles.estadoAuditado}>
          {esNuevaPlanta ? (
            <FaExclamationTriangle size={20} color={estilo.status} />
          ) : (
            <FaCheckCircle size={20} color={estilo.status} />
          )}
        </div>
      </div>

      {/* 2. LÍNEA DE AUTORÍA */}
      <div style={styles.autorBox}>
        <div style={styles.perfilAutor}>
          <span style={{ ...styles.alias, color: estilo.sub }}>
            @{(log.alias || "explorador").toLowerCase()}
          </span>
        </div>

        {!esNuevaPlanta && (
          <div style={{ ...styles.tagGrupo, backgroundColor: estilo.titulo }}>
            {log.nombre_grupo || "Sin grupo"}
          </div>
        )}
      </div>

      {/* 3. BLOQUE DE UBICACIÓN (Solo para Nueva Ubicación) */}
      {log.tipo_accion === "nueva_ubicacion" && (
        <div style={styles.contenedorVerde}>
          <span style={styles.labelUbicacion}>LOCALIZACIÓN</span>
          <p style={styles.textoDestacado}>
            {log.distrito ? `${log.distrito}, ` : ""}
            {log.ciudad || "Ubicación desconocida"}
          </p>
        </div>
      )}

      {/* 4. FOOTER: Ahora sí usando badgeBack y badgeText directamente */}
      <div
        style={{
          ...styles.filaSecundaria,
          borderTop: `1px solid ${esNuevaPlanta ? "rgba(0,0,0,0.05)" : "#f8fafc"}`,
        }}
      >
        <div
          style={{
            ...styles.badgeTipo,
            backgroundColor: estilo.badgeBack, // <--- AQUÍ OBEDECE EL COLOR DE FONDO
            color: estilo.badgeText, // <--- AQUÍ OBEDECE EL COLOR DE TEXTO
          }}
        >
          {log.tipo_accion?.replace("_", " ").toUpperCase()}
        </div>
        <div style={styles.fechaBox}>
          <TbCalendar size={14} color={estilo.sub} />
          <span style={{ color: estilo.sub }}>
            {new Date(log.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    borderRadius: 20,
    padding: "5px 12px 12px 12px",
    marginBottom: 15,
    border: "1px solid #f1f5f9",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.04)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  filaPrincipal: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoPlantaContenedor: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  circuloIcono: {
    width: 28,
    height: 28,
    borderRadius: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  nombrePlanta: {
    fontSize: 18,
    fontWeight: "900",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "-0.5px",
  },
  estadoAuditado: {
    display: "flex",
    alignItems: "center",
    paddingLeft: 10,
  },
  autorBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: -4,
    minHeight: "26px",
  },
  perfilAutor: {
    display: "flex",
    alignItems: "center",
  },
  alias: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: "5px",
  },
  tagGrupo: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: 6,
    letterSpacing: "0.5px",
  },
  contenedorVerde: {
    marginTop: 8,
    padding: "16px",
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    border: "1px solid #dcfce7",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  labelUbicacion: {
    fontSize: 9,
    fontWeight: "900",
    color: "#2d8b57",
    opacity: 0.7,
  },
  textoDestacado: {
    fontSize: 16,
    fontWeight: "900",
    color: "#2f4538",
    margin: 0,
    textTransform: "uppercase",
  },
  filaSecundaria: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  badgeTipo: {
    marginTop: "11px",
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "800",
  },
  fechaBox: {
    marginTop: "11px",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: "600",
  },
};