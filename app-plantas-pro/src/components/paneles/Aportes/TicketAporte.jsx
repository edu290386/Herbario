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

  const getBadgeConfig = () => {
    const final = estaAuditado ? estadoAuditado : estadoRevisado;
    if (final === "aprobado")
      return { texto: "APROBADO", color: "#166534", bg: "#dcfce7" };
    if (final === "rechazado")
      return { texto: "RECHAZADO", color: "#991b1b", bg: "#fef2f2" };
    return { texto: "EN REVISIÓN", color: "#92400e", bg: "#fef3c7" };
  };

  const badge = getBadgeConfig();

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
      alert("⚠️ Comentario obligatorio para justificar esta acción.");
      return;
    }
    onProcesar(ticket.id, accion, comentario);
    setComentario("");
  };

  return (
    <div style={styles.card}>
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
            ? new Date(ticket.created_at).toLocaleDateString()
            : "--/--/--"}
        </span>
      </div>

      {(estadoRevisado !== "pendiente" || estaAuditado) && (
        <div style={styles.historyContainer}>
          {estadoRevisado !== "pendiente" && (
            <div style={styles.messageRow}>
              <div style={styles.iconContainer}>
                {getDecisionIcon(estadoRevisado, false)}
              </div>
              <div style={styles.messageContent}>
                <span style={styles.messageLabel}>
                  REVISADO POR: {ticket.revisado_por || "Staff"}
                </span>
                <p style={styles.messageText}>
                  {mensajesStaff.revisado || "Sin observaciones."}
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
                  AUDITADO POR: {ticket.auditado_por || "Admin"}
                </span>
                <p style={styles.messageText}>
                  {mensajesStaff.auditado || "Validación completada."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={styles.mediaContainer}>
        {esImagen ? (
          <>
            <div style={styles.tagCategoria}>
              {contenido.categoria || "APORTE"}
            </div>
            {contenido.url ? (
              <img src={contenido.url} alt="Aporte" style={styles.imagenReal} />
            ) : (
              <div style={styles.imagenPlaceholder}>Sin Imagen</div>
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

      {canReview &&
        !estaAuditado &&
        (estadoRevisado === "pendiente" || isAdmin) && (
          <div style={styles.actionContainer}>
            <textarea
              style={styles.inputComentario}
              placeholder="Comentario..."
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
    backgroundColor: "#1a1a1a",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  imagenReal: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" },
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
