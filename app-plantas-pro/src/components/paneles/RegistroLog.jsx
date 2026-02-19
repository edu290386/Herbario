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
  // --- LÓGICA DE ROLES Y VISIBILIDAD ---
  const isAdmin = userRole === "Administrador" || userRole === "admin";
  const isColab = userRole === "Colaborador";
  const esPanelGestion = panelType === "control" || panelType === "gestion";

  // NUEVA LÓGICA:
  // Los botones SOLO aparecen si el estado es exactamente 'pendiente'.
  // Si es 'aprobado', la tarjeta se queda pero los botones desaparecen.
  // Si es 'rechazado', el componente padre debería eliminarlo del array de datos.
  const mostrarBotones =
    esPanelGestion && (isAdmin || isColab) && log.revisado === "pendiente";

  const urlOriginal = log.contenido;
  const etiqueta =
    log.tipo_accion === "nueva_imagen" ? log.contenido?.split("|")[0] : null;
  const urlOptimizada = urlOriginal?.includes("|")
    ? urlOriginal.split("|")[1]
    : urlOriginal;

  return (
    <div style={styles.card}>
      {/* 1. FOTO */}
      {log.tipo_accion === "nueva_imagen" && urlOriginal?.includes("http") && (
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
            <div style={styles.circuloIcono}>
              <FaLeaf size={12} color={colores.frondoso} />
            </div>
            <p style={styles.nombrePlanta}>{log.nombre_planta}</p>
          </div>

          <div
            style={{
              ...styles.estadoIcono,
              cursor: isAdmin ? "pointer" : "default",
            }}
            onClick={() => {
              if (isAdmin && onReview) {
                onReview(log, "auditado_final_admin");
              }
            }}
          >
            {log.auditado === "revisado" || log.revisado === "aprobado" ? (
              <FaRegCheckCircle size={32} color={colores.frondoso} />
            ) : (
              <FaExclamationTriangle size={32} color="#e2e8f0" />
            )}
          </div>
        </div>

        <p style={styles.alias}>@{log.alias || "explorador"}</p>

        {/* 3. CONTENEDORES VERDES */}
        {log.tipo_accion?.includes("nombre") && (
          <div style={styles.contenedorVerde}>
            <span style={styles.labelVerde}>NOMBRE Y PAÍS SUGERIDO</span>
            <p style={styles.textoDestacado}>{log.contenido}</p>
          </div>
        )}

        {log.tipo_accion === "nueva_ubicacion" && (
          <div style={styles.contenedorVerde}>
            <div style={styles.headerContenedor}>
              <span style={styles.labelVerde}>UBICACIÓN EXCLUSIVA</span>
              <span style={styles.tagGrupo}>
                {log.nombre_grupo || "SIN GRUPO"}
              </span>
            </div>
            <p style={styles.textoDestacado}>
              {log.distrito ? `${log.distrito}, ` : ""}
              {log.ciudad || "UBICACIÓN DESCONOCIDA"}
            </p>
            {isAdmin && (
              <div style={styles.adminData}>
                LAT: {log.latitud?.toFixed(5)} | LNG: {log.longitud?.toFixed(5)}
              </div>
            )}
          </div>
        )}

        {/* 4. FOOTER */}
        <div style={styles.filaSecundaria}>
          <div style={styles.badgeTipo}>
            <span style={styles.badgeText}>
              {log.tipo_accion?.replace("_", " ")}
            </span>
          </div>
          {/* Indicador visual de estado si ya fue aprobado */}
          {log.revisado === "aprobado" && (
            <span style={{ ...styles.badgeText, color: colores.frondoso }}>
              ✓ APROBADO
            </span>
          )}
          <span style={styles.fecha}>
            {new Date(log.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* 5. SECCIÓN DE ACCIONES (Solo si está pendiente) */}
      {mostrarBotones && (
        <div style={styles.footerAcciones}>
          <button
            onClick={() =>
              onAction && onAction(log, "filtro_operativo_rechazar")
            }
            style={styles.btnRechazar}
          >
            RECHAZAR
          </button>
          <button
            onClick={() =>
              onAction && onAction(log, "filtro_operativo_aprobar")
            }
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
    borderRadius: 28,
    marginBottom: 24,
    border: "1px solid #f1f5f9",
    overflow: "hidden",
    boxShadow: "0 12px 20px -5px rgba(0, 0, 0, 0.04)",
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
    bottom: 15,
    right: 15,
    backgroundColor: "rgba(47, 69, 56, 0.85)",
    backdropFilter: "blur(6px)",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: 10,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  cuerpoData: {
    padding: "20px 24px",
  },
  filaPrincipal: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  infoPlantaContenedor: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  circuloIcono: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f0fdf4",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  nombrePlanta: {
    fontSize: 20,
    fontWeight: "900",
    color: colores.bosque,
    margin: 0,
    letterSpacing: "-0.5px",
  },
  alias: {
    fontSize: 14,
    color: colores.tierra,
    margin: "4px 0 0 34px",
    fontWeight: "600",
  },
  contenedorVerde: {
    marginTop: 18,
    padding: "18px",
    backgroundColor: "#f0fdf4",
    borderRadius: 22,
    border: "1px solid #dcfce7",
    borderLeft: `6px solid ${colores.frondoso}`,
  },
  headerContenedor: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  labelVerde: {
    fontSize: 10,
    fontWeight: "900",
    color: colores.frondoso,
    letterSpacing: "0.8px",
  },
  tagGrupo: {
    fontSize: 12,
    fontWeight: "900",
    backgroundColor: colores.bosque,
    color: "#fff",
    padding: "5px 12px",
    borderRadius: 8,
    textTransform: "uppercase",
  },
  textoDestacado: {
    fontSize: 18,
    fontWeight: "900",
    color: colores.bosque,
    margin: 0,
    textTransform: "uppercase",
    lineHeight: "1.2",
  },
  adminData: {
    fontSize: 9,
    color: "#94a3b8",
    marginTop: 10,
    paddingTop: 8,
    borderTop: "1px dashed #dcfce7",
    fontFamily: "monospace",
  },
  filaSecundaria: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  badgeTipo: {
    padding: "6px 12px",
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
  },
  fecha: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "600",
  },
  footerAcciones: {
    padding: "0 24px 24px 24px",
    display: "flex",
    gap: 12,
    marginTop: 10,
  },
  btnAprobar: {
    flex: 1,
    padding: "18px",
    borderRadius: 16,
    border: "none",
    backgroundColor: colores.bosque,
    color: "#fff",
    fontWeight: "900",
    fontSize: 13,
    cursor: "pointer",
    boxShadow: "0 6px 15px rgba(47, 69, 56, 0.25)",
  },
  btnRechazar: {
    flex: 1,
    padding: "18px",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    color: "#94a3b8",
    fontWeight: "700",
    fontSize: 11,
    cursor: "pointer",
  },
};
