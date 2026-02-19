import React from "react";
import {
  FaRegCheckCircle,
  FaExclamationTriangle,
  FaLeaf,
} from "react-icons/fa";

const colores = {
  azul: "#3b82f6",
  bosque: "#2f4538",
  frondoso: "#2d8b57",
  tierra: "#64748b",
  fondo: "#f8fafc",
};

export const RegistroLog = ({
  log,
  userRole,
  panelType,
  onAction,
  onReview,
}) => {
  const isAdmin = userRole === "admin";
  const esGestion = panelType === "control";
  const estaAuditado = log.auditado === "revisado";
  const mostrarBotones = esGestion && log.revisado === "pendiente";

  // Lógica para imágenes (se mantiene igual para procesar el pipe si viene ahí)
  const urlOriginal = log.contenido;
  const etiqueta =
    log.tipo_accion === "nueva_imagen" ? log.contenido?.split("|")[0] : null;
  const urlOptimizada = urlOriginal?.includes("|")
    ? urlOriginal.split("|")[1]
    : urlOriginal;

  return (
    <div style={styles.card}>
      {/* 1. FOTO (4:5) */}
      {esGestion &&
        log.tipo_accion === "nueva_imagen" &&
        urlOriginal?.includes("http") && (
          <div style={styles.contenedorImagen}>
            <img
              src={urlOptimizada}
              style={styles.imagen}
              alt="Evidencia"
              loading="lazy"
            />
            {etiqueta && <div style={styles.floatingTag}>{etiqueta}</div>}
          </div>
        )}

      {/* 2. CUERPO DE DATOS */}
      <div style={styles.cuerpoData}>
        <div style={styles.filaPrincipal}>
          <div style={styles.infoPlantaContenedor}>
            <FaLeaf size={12} color={colores.frondoso} />
            <p style={styles.nombrePlanta}>{log.nombre_planta}</p>
          </div>

          <div
            style={{
              ...styles.estadoIcono,
              cursor: isAdmin && !estaAuditado ? "pointer" : "default",
            }}
            onClick={() =>
              isAdmin && !estaAuditado && onReview(log, "auditado_final_admin")
            }
          >
            {estaAuditado ? (
              <FaRegCheckCircle size={28} color={colores.frondoso} />
            ) : (
              <FaExclamationTriangle size={28} color="#cbd5e1" />
            )}
          </div>
        </div>

        <p style={styles.alias}>@{log.alias || "usuario"}</p>

        {/* 3. BLOQUE CONDICIONAL: NOMBRE O UBICACIÓN */}
        {log.tipo_accion?.includes("nombre") && (
          <div style={styles.contenedorPropuesta}>
            <span style={styles.propuestaLabel}>NOMBRE Y PAÍS SUGERIDO</span>
            <p style={styles.propuestaTexto}>{log.contenido}</p>
          </div>
        )}

        {log.tipo_accion === "nueva_ubicacion" && (
          <div style={styles.contenedorPropuestaUbicacion}>
            <div style={styles.headerUbicacion}>
              <span style={styles.propuestaLabel}>GRUPO EXCLUSIVO:</span>
              <span style={styles.tagGrupo}>{log.nombre_grupo || "Sin grupo"}</span>
            </div>
            <p style={styles.propuestaTexto}>
              {log.distrito ? `${log.distrito}, ` : ""}
              {log.ciudad?.toUpperCase()}
            </p>
          </div>
        )}

        {/* 4. FOOTER DE LA CARD */}
        <div style={styles.filaSecundaria}>
          <div style={styles.badge}>
            <span style={styles.badgeText}>
              {log.tipo_accion?.replace("_", " ")}
            </span>
          </div>
          <span style={styles.fecha}>
            {new Date(log.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* 5. ACCIONES */}
      {mostrarBotones && (
        <div style={styles.footerAcciones}>
          <button
            onClick={() => onAction(log, "filtro_operativo_rechazar")}
            style={styles.btnRechazar}
          >
            DESCARTAR
          </button>
          <button
            onClick={() => onAction(log, "filtro_operativo_aprobar")}
            style={styles.btnAprobar}
          >
            APROBAR
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
    overflow: "hidden",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
  },
  contenedorImagen: {
    width: "100%",
    aspectRatio: "4 / 5",
    backgroundColor: "#f8fafc",
    position: "relative",
  },
  imagen: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  floatingTag: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(47, 69, 56, 0.8)",
    backdropFilter: "blur(4px)",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  cuerpoData: {
    padding: "20px",
  },
  filaPrincipal: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoPlantaContenedor: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  nombrePlanta: {
    fontSize: 18,
    fontWeight: "800",
    color: colores.bosque,
    margin: 0,
    letterSpacing: "-0.5px",
  },
  alias: {
    fontSize: 14,
    color: colores.tierra,
    margin: "2px 0 0 20px",
    fontWeight: "500",
  },
  contenedorPropuestaUbicacion: {
    marginTop: 16,
    padding: "14px",
    backgroundColor: "#f0fdf4", // Verde muy suave
    borderRadius: 16,
    border: "1px solid #dcfce7",
    borderLeft: `5px solid ${colores.frondoso}`, // Sello visual de exclusividad
  },
  propuestaLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colores.frondoso,
    display: "block",
    marginBottom: 4,
    letterSpacing: "0.5px",
  },
  propuestaTexto: {
    fontSize: 17,
    fontWeight: "800",
    color: colores.bosque,
    margin: 0,
    textTransform: "uppercase",
  },
  filaSecundaria: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  badge: {
    padding: "5px 10px",
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
  },
  fecha: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  footerAcciones: {
    padding: "0 20px 20px 20px",
    display: "flex",
    gap: 12,
  },
  btnAprobar: {
    flex: 2,
    padding: "14px",
    borderRadius: 12,
    border: "none",
    backgroundColor: colores.bosque,
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
    cursor: "pointer",
  },
  btnRechazar: {
    flex: 1,
    padding: "14px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    color: "#64748b",
    fontWeight: "700",
    fontSize: 12,
    cursor: "pointer",
  },
  headerUbicacion: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  tagGrupo: {
    fontSize: 10,
    fontWeight: "900",
    backgroundColor: colores.bosque,
    color: "#fff",
    padding: "2px 8px",
    borderRadius: 4,
    textTransform: "uppercase",
  },
};
