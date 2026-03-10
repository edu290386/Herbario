import { useState } from "react";
import { FaRegCheckCircle, FaUserEdit } from "react-icons/fa";
import { TiDelete } from "react-icons/ti";
import { LiaCheckDoubleSolid } from "react-icons/lia";

export const TicketAporte = ({ ticket, userRole, onProcesar }) => {
  const [comentario, setComentario] = useState("");

  const isAdmin = userRole === "Administrador";
  const canReview = userRole === "Colaborador" || isAdmin;

  const estadoRevisado = ticket.revisado || "pendiente";
  const estadoAuditado = ticket.auditado || "pendiente";
  const estaAuditado = estadoAuditado !== "pendiente";

  // Parseo de mensajes
  let mensajesStaff = {};
  try {
    mensajesStaff =
      typeof ticket.mensaje_staff === "string"
        ? JSON.parse(ticket.mensaje_staff)
        : ticket.mensaje_staff || {};
  } catch (error) {
    console.error("Error parseando mensajes staff:", error);
  }

  const contenido = ticket.contenido || {};
  const esImagen = ticket.tipo_accion === "nueva_imagen";

  // Configuración de etiqueta simplificada (3 estados)
  const getBadgeConfig = () => {
    const final = estaAuditado ? estadoAuditado : estadoRevisado;
    if (final === "aprobado")
      return { texto: "APROBADO", color: "#166534", bg: "#dcfce7" };
    if (final === "rechazado")
      return { texto: "OBSERVADO", color: "#991b1b", bg: "#fef2f2" };
    return { texto: "EN REVISIÓN", color: "#92400e", bg: "#fef3c7" };
  };

  const badge = getBadgeConfig();

  // Iconos para el historial
  const getDecisionIcon = (estado, esAdmin) => {
    if (estado === "aprobado")
      return esAdmin ? (
        <LiaCheckDoubleSolid size={16} color="#166534" />
      ) : (
        <FaRegCheckCircle size={14} color="#166534" />
      );
    if (estado === "rechazado") return <TiDelete size={18} color="#dc2626" />;
    return <FaUserEdit size={14} color="#64748b" />;
  };

  const handleAccionDirecta = (accion) => {
    const requiereComentario =
      accion === "rechazar" ||
      (accion === "auditar_rechazar" && estadoRevisado === "aprobado") ||
      (accion === "auditar_aprobar" && estadoRevisado === "rechazado");

    if (requiereComentario && !comentario.trim()) {
      alert(
        "⚠️ Es OBLIGATORIO escribir un comentario para justificar esta decisión.",
      );
      return;
    }

    onProcesar(ticket.id, accion, comentario);
    setComentario("");
  };

  const mostrarBarraAcciones =
    canReview && !estaAuditado && (estadoRevisado === "pendiente" || isAdmin);

  return (
    <div style={styles.card}>
      {/* 1. CABECERA (Fecha Local Estándar) */}
      <div style={styles.header}>
        <span style={styles.alias}>@{ticket.alias || "Anónimo"}</span>
        <div
          style={{
            ...styles.badge,
            color: badge.color,
            backgroundColor: badge.bg,
          }}
        >
          {badge.texto}
        </div>
        <span style={styles.fecha}>
          {ticket.created_at
            ? new Date(ticket.created_at).toLocaleString(undefined, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "--/--/--"}
        </span>
      </div>

      {/* 2. HISTORIAL */}
      {(estadoRevisado !== "pendiente" || estaAuditado) && (
        <div style={styles.historyContainer}>
          {estadoRevisado !== "pendiente" && (
            <div style={styles.messageRow}>
              <div style={styles.iconContainer}>
                {getDecisionIcon(estadoRevisado, false)}
              </div>
              <div style={styles.messageContent}>
                <span style={styles.messageLabel}>
                  Revisado por: {ticket.revisado_por || "Colaborador"}
                </span>
                <p style={styles.messageText}>
                  {mensajesStaff.revisado || "Aporte verificado."}
                </p>
              </div>
            </div>
          )}
          {estaAuditado && (
            <div
              style={{
                ...styles.messageRow,
                marginTop: "10px",
                borderTop: "1px dashed #e2e8f0",
                paddingTop: "10px",
              }}
            >
              <div style={styles.iconContainer}>
                {getDecisionIcon(estadoAuditado, true)}
              </div>
              <div style={styles.messageContent}>
                <span style={styles.messageLabel}>
                  Auditado por: {ticket.auditado_por || "Admin"}
                </span>
                <p style={styles.messageText}>
                  {mensajesStaff.auditado || "Validación completada."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. ÁREA VISUAL */}
      <div style={styles.mediaContainer}>
        {esImagen ? (
          <>
            <div style={styles.tagCategoria}>
              {contenido.categoria || "APORTE"}
            </div>
            {contenido.url ? (
              <img src={contenido.url} alt="Aporte" style={styles.imagenReal} />
            ) : (
              <div style={styles.imagenPlaceholder}>
                <span style={{ color: "#94a3b8" }}>Sin Imagen</span>
              </div>
            )}
          </>
        ) : (
          <div style={styles.textoContainer}>
            <h3 style={styles.textoDestacado}>
              "{contenido.nombre || "Propuesta"}"
            </h3>
          </div>
        )}
      </div>

      {/* 4. ACCIÓN */}
      {mostrarBarraAcciones && (
        <div style={styles.actionContainer}>
          <textarea
            style={styles.inputComentario}
            placeholder="Escribe un comentario para el usuario ..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={2}
          />
          <div style={styles.actionBar}>
            <div style={{ flex: 1 }}></div>
            <div style={styles.accionesDerecha}>
              {estadoRevisado === "pendiente" ? (
                <>
                  <button
                    style={styles.iconBtnRechazar}
                    onClick={() => handleAccionDirecta("rechazar")}
                  >
                    <TiDelete size={34} />
                  </button>
                  <button
                    style={styles.iconBtnAprobar}
                    onClick={() => handleAccionDirecta("aprobar")}
                  >
                    <FaRegCheckCircle size={24} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    style={styles.iconBtnRechazar}
                    onClick={() => handleAccionDirecta("auditar_rechazar")}
                  >
                    <TiDelete size={34} />
                  </button>
                  <button
                    style={styles.iconBtnAuditar}
                    onClick={() => handleAccionDirecta("auditar_aprobar")}
                  >
                    <LiaCheckDoubleSolid size={28} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    borderRadius: "16px",
    marginBottom: "20px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  alias: { fontSize: "0.85rem", fontWeight: "800", color: "#1e293b", flex: 1 },
  fecha: { fontSize: "0.75rem", color: "#94a3b8", flex: 1, textAlign: "right" },
  badge: {
    fontSize: "0.7rem",
    fontWeight: "900",
    padding: "2px 6px",
    borderRadius: "12px",
    minWidth: "85px",
    textAlign: "center",
  },
  historyContainer: {
    padding: "12px 16px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #f1f5f9",
  },
  messageRow: { display: "flex", gap: "12px", alignItems: "flex-start" },
  iconContainer: {
    marginTop: "2px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "16px",
  },
  messageContent: { display: "flex", flexDirection: "column", flex: 1 },
  messageLabel: {
    fontSize: "0.7rem",
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: "0.5px",
    marginBottom: "2px",
    
  },
  messageText: {
    margin: "0",
    fontSize: "0.85rem",
    color: "#334155",
    lineHeight: "1.4",
    fontStyle: "italic",
  },
  mediaContainer: {
    width: "100%",
    aspectRatio: "3 / 4",
    backgroundColor: "#f1f5f9",
    position: "relative",
  },
  tagCategoria: {
    position: "absolute",
    top: "12px",
    left: "12px",
    backgroundColor: "rgba(45, 139, 87, 0.85)",
    color: "#fff",
    padding: "3px 8px",
    borderRadius: "4px",
    fontSize: "0.65rem",
    fontWeight: "800",
    textTransform: "uppercase",
    zIndex: 2,
  },
  imagenReal: { width: "100%", height: "100%", objectFit: "cover" },
  imagenPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0",
  },
  textoDestacado: {
    fontSize: "1.2rem",
    fontWeight: "800",
    color: "#2d5a27",
    textAlign: "center",
    padding: "40px 20px",
  },
  actionContainer: {
    padding: "12px 16px",
    borderTop: "1px solid #f1f5f9",
    backgroundColor: "#f8fafc",
  },
  inputComentario: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "0.85rem",
    resize: "none",
  },
  actionBar: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: "8px",
    alignItems: "center",
  },
  accionesDerecha: { display: "flex", alignItems: "center", gap: "12px" },
  iconBtnRechazar: {
    background: "none",
    border: "none",
    color: "#dc2626",
    cursor: "pointer",
    display: "flex",
  },
  iconBtnAprobar: {
    background: "none",
    border: "none",
    color: "#166534",
    cursor: "pointer",
    display: "flex",
  },
  iconBtnAuditar: {
    background: "none",
    border: "none",
    color: "#0369a1",
    cursor: "pointer",
    display: "flex",
  },
};
