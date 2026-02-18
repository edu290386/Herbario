import { FaRegCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { colores } from "../../constants/tema";

export const LogCard = ({ log, userRole, panelType, onAction, onReview }) => {
  const esGestion = panelType === "gestion";
  const isAdmin = userRole === "Administrador";

  // PUNTO 2: El filtro operativo (Botones) desaparece si el log ya fue REVISADO
  const mostrarBotones = esGestion && !log.revisado;

  // PUNTO 3: El Check Azul solo aparece si TÚ diste el veredicto final
  const tieneVeredicto = log.veredicto === "revisado";

  // 1. PROCESAR CONTENIDO (etiqueta|url para imágenes)
  const partes = log.contenido?.split("|") || [];
  const esNuevaImagen = log.tipo_accion === "nueva_imagen";
  const etiqueta = esNuevaImagen ? partes[0] : "";
  const urlOriginal = esNuevaImagen ? partes[1] : log.contenido;

  // OPTIMIZACIÓN CLOUDINARY
  const urlOptimizada =
    urlOriginal &&
    typeof urlOriginal === "string" &&
    urlOriginal.includes("cloudinary")
      ? urlOriginal.replace("/upload/", "/upload/w_400,f_auto,q_auto/")
      : urlOriginal;

  return (
    <div style={styles.card}>
      {/* 2. FOTO (Solo en Gestión si es imagen) */}
      {esGestion && urlOriginal?.includes("http") && (
        <div style={styles.contenedorImagen}>
          <img
            src={urlOptimizada}
            style={styles.imagen}
            alt="Evidencia"
            loading="lazy"
          />
        </div>
      )}

      {/* 3. CUERPO DE DATOS */}
      <div style={styles.cuerpoData}>
        <div style={styles.filaPrincipal}>
          <div>
            <p style={styles.nombrePlanta}>{log.nombre_planta}</p>
            <p style={styles.alias}>@{log.alias || "usuario"}</p>
          </div>

          {/* ICONO DE AUDITORÍA (PUNTO 3) */}
          <div
            style={{
              ...styles.estadoIcono,
              cursor: isAdmin && !tieneVeredicto ? "pointer" : "default",
            }}
            onClick={() =>
              isAdmin &&
              !tieneVeredicto &&
              onReview(log, "veredicto_final_admin")
            }
            title={isAdmin ? "Dar veredicto final" : ""}
          >
            {tieneVeredicto ? (
              <FaRegCheckCircle size={32} color={colores.azul} />
            ) : (
              <FaExclamationTriangle size={32} color="#cbd5e1" />
            )}
          </div>
        </div>

        <div style={styles.filaSecundaria}>
          <div style={styles.badge}>
            <span style={styles.badgeText}>
              {log.tipo_accion?.replace("_", " ")}
              {etiqueta && ` (${etiqueta})`}
            </span>
          </div>
          <span style={styles.fecha}>
            {new Date(log.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* INFO DE AUDITORÍA (Solo si tú ya lo revisaste) */}
      </div>

      {/* 4. BOTONES DE GESTIÓN (PUNTO 2) */}
      {mostrarBotones && (
        <div style={styles.footerAcciones}>
          <button
            onClick={() => onAction(log, "filtro_operativo_aprobar")}
            style={styles.btnAprobar}
          >
            APROBAR
          </button>
          <button
            onClick={() => onAction(log, "filtro_operativo_rechazar")}
            style={styles.btnRechazar}
          >
            RECHAZAR
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    marginBottom: 20,
    border: "1px solid #f1f5f9",
    borderLeft: `12px solid ${colores.azul}`,
    overflow: "hidden",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  contenedorImagen: {
    width: "100%",
    aspectRatio: "1 / 1",
    backgroundColor: "#f8fafc",
  },
  imagen: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cuerpoData: {
    padding: "16px 20px",
  },
  filaPrincipal: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nombrePlanta: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    margin: 0,
  },
  alias: {
    fontSize: 14,
    color: "#64748b",
    margin: 0,
  },
  estadoIcono: {
    padding: "4px",
  },
  filaSecundaria: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  badge: {
    padding: "4px 10px",
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
  },
  fecha: {
    fontSize: 12,
    color: "#94a3b8",
  },
  auditoria: {
    marginTop: 10,
    paddingTop: 8,
    borderTop: "1px dashed #e2e8f0",
  },
  auditoriaText: {
    fontSize: 11,
    color: "#3b82f6",
    margin: 0,
    fontStyle: "italic",
  },
  footerAcciones: {
    padding: "0 20px 20px 20px",
    display: "flex",
    gap: 12,
  },
  btnAprobar: {
    flex: 1,
    padding: "14px",
    borderRadius: 12,
    border: "none",
    backgroundColor: colores.azul,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    cursor: "pointer",
  },
  btnRechazar: {
    flex: 1,
    padding: "14px",
    borderRadius: 12,
    border: "none",
    backgroundColor: "#f1f5f9",
    color: "#64748b",
    fontWeight: "bold",
    fontSize: 12,
    cursor: "pointer",
  },
};
