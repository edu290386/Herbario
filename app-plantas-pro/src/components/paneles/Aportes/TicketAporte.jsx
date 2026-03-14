import { useState } from "react";
import { FaRegCheckCircle, FaUserEdit, FaBan } from "react-icons/fa";
import { TiDelete } from "react-icons/ti";
import { LiaCheckDoubleSolid } from "react-icons/lia";

export const TicketAporte = ({ ticket, userRole, onProcesar }) => {
  const [comentario, setComentario] = useState("");
  const isAdmin = userRole === "Administrador";

  // --- LÓGICA DE ESTADOS SIMÉTRICA ---
  const estadoRevisado = ticket.revisado || "pendiente";
  const estadoAuditado = ticket.auditado || "pendiente";

  const esBaneado = estadoAuditado === "baneado";
  const procesoTerminado =
    estadoAuditado !== "pendiente" && estadoAuditado !== null;

  const esNombre = ticket.tipo_accion === "nuevo_nombre";
  const esComentario = ticket.tipo_accion === "nuevo_comentario";

  // Identificamos si este comentario es en realidad un reporte de ubicación
  const esReporteUbicacion =
    esComentario && ticket.contenido?.tipo === "reporte_ubicacion";

  const canReview = isAdmin || (userRole === "Colaborador" && !esComentario);

  let mensajesStaff = {};
  try {
    const raw = ticket.mensaje_staff;
    if (raw)
      mensajesStaff = typeof raw === "string" ? JSON.parse(raw) : { ...raw };
  } catch (error) {
    mensajesStaff = { error };
  }

  const contenido = ticket.contenido || {};

  const getBadgeConfig = () => {
    if (esBaneado) return { texto: "BANEADO", color: "#ffffff", bg: "#000000" };

    // 🟢 MAGIA AQUÍ: Si pasó la etapa 1 (o es autoverificado) pero FALTA tu Auditoría
    if (estadoRevisado === "aprobado" && estadoAuditado === "pendiente") {
      return { texto: "POR AUDITAR", color: "#0369a1", bg: "#e0f2fe" }; // Azul para que resalte
    }

    const final = procesoTerminado ? estadoAuditado : estadoRevisado;
    if (final === "aprobado")
      return { texto: "APROBADO", color: "#166534", bg: "#dcfce7" };
    if (final === "rechazado")
      return { texto: "OBSERVADO", color: "#991b1b", bg: "#fef2f2" };

    return { texto: "EN REVISIÓN", color: "#92400e", bg: "#fef3c7" };
  };

  const badge = getBadgeConfig();

  const getDecisionIcon = (estado, esEtapaAudit) => {
    if (estado === "aprobado")
      return esEtapaAudit ? (
        <LiaCheckDoubleSolid size={16} color="#166534" />
      ) : (
        <FaRegCheckCircle size={14} color="#166534" />
      );
    if (estado === "rechazado") return <TiDelete size={18} color="#dc2626" />;
    if (estado === "baneado") return <FaBan size={12} color="#000000" />;
    return <FaUserEdit size={14} color="#64748b" />;
  };

  const handleAccionDirecta = (accion) => {
    let comentarioFinal = comentario.trim();
    const requiereComentario =
      accion.includes("rechazar") || accion === "banear";

    if (requiereComentario && !comentarioFinal) {
      alert(
        `⚠️ Comentario obligatorio para el ${accion === "banear" ? "BANEO" : "RECHAZO"}.`,
      );
      return;
    }

    if (esComentario && !requiereComentario && !comentarioFinal) {
      comentarioFinal = "Gracias por tu aporte.";
    }

    onProcesar(ticket.id, accion, comentarioFinal);
    setComentario("");
  };

  return (
    <div style={styles.card}>
      {/* 1. BANNER PLANTA */}
      <div style={styles.plantaHeader}>
        <h1 style={styles.plantaNombre}>
          {ticket.nombre_planta?.toUpperCase() || "PLANTA"}
        </h1>
        {esReporteUbicacion && contenido.distrito_reportado && (
          <p style={styles.plantaSubtitulo}>
            Distrito: {contenido.distrito_reportado}
          </p>
        )}
      </div>

      {/* 2. HEADER INFO (Alias, Badge y Fecha) */}
      <div style={styles.header}>
        <span style={styles.alias}>@{ticket.alias || "Usuario"}</span>
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
            : "--/--"}
        </span>
      </div>

      {/* 3. HISTORIAL STAFF (Etapa 1 y Etapa 2) */}
      <div style={styles.historyContainer}>
        {/* ETAPA 1: VERIFICACIÓN */}
        {mensajesStaff.revisado && (
          <div style={styles.messageRow}>
            <div style={styles.iconContainer}>
              {getDecisionIcon(estadoRevisado, false)}
            </div>
            <div style={styles.messageContent}>
              <span style={styles.messageLabel}>
                Revisado por: {ticket.revisado_por}
              </span>
              <p style={styles.messageText}>{mensajesStaff.revisado}</p>
            </div>
          </div>
        )}

        {/* ETAPA 2: AUDITORÍA O BANEO */}
        {procesoTerminado && mensajesStaff.auditado && (
          <div
            style={{
              ...styles.messageRow,
              marginTop: mensajesStaff.revisado ? "10px" : "0",
              borderTop: mensajesStaff.revisado ? "1px dashed #ccc" : "none",
              paddingTop: mensajesStaff.revisado ? "10px" : "0",
            }}
          >
            <div style={styles.iconContainer}>
              {getDecisionIcon(estadoAuditado, true)}
            </div>
            <div style={styles.messageContent}>
              <span style={styles.messageLabel}>
                {esBaneado ? "Baneado por:" : "Auditado por:"}{" "}
                {ticket.auditado_por}
              </span>
              <p
                style={{
                  ...styles.messageText,
                  color: esBaneado ? "#dc2626" : "#334155",
                  fontWeight: esBaneado ? "900" : "normal",
                }}
              >
                {mensajesStaff.auditado}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. ÁREA DE CONTENIDO (ESTILO INSTAGRAM) */}
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* PARTE A: TEXTO (Con márgenes blancos elegantes) */}
        {(esNombre || esComentario) && (
          <div style={styles.fichaCompacta}>
            <div style={styles.cuerpoFicha}>
              {esNombre && (
                <div style={styles.itemFicha}>
                  <span style={styles.labelFicha}>PROPUESTA ACTUAL</span>
                  <h2 style={styles.valorFichaVerde}>
                    {contenido.nombre_sugerido}{" "}
                    <span style={styles.paisParentesis}>
                      ({contenido.procedencia})
                    </span>
                  </h2>
                </div>
              )}

              {esComentario && (
                <div style={styles.itemFicha}>
                  <span style={styles.labelFicha}>
                    {esReporteUbicacion ? "MOTIVO DEL REPORTE" : "COMENTARIO"}
                  </span>
                  <p style={styles.valorFichaGris}>
                    {contenido.texto || contenido.comentario}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PARTE B: IMAGEN (Sin márgenes, de borde a borde en 3:4) */}
        {(ticket.tipo_accion === "nueva_imagen" ||
          (esComentario && contenido.url)) && (
          <div style={styles.mediaContainer}>
            <div
              style={{
                ...styles.tagCategoria,
                backgroundColor: esReporteUbicacion
                  ? "rgba(220, 38, 38, 0.85)"
                  : "rgba(45, 139, 87, 0.85)",
              }}
            >
              {esComentario
                ? "REPORTE"
                : contenido.categoria}
            </div>
            <img
              src={contenido.url}
              alt="Aporte Visual"
              style={styles.imagenReal}
            />
          </div>
        )}
      </div>

      {/* 5. ACCIONES (Controles de Moderación Simétricos) */}
      {canReview &&
        !procesoTerminado &&
        (estadoRevisado === "pendiente" || isAdmin) && (
          <div style={styles.actionContainer}>
            <textarea
              style={styles.inputComentario}
              placeholder="Escribe un motivo o comentario..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={2}
            />
            <div style={styles.actionBar}>
              <div style={{ flex: 1 }}></div>
              <div style={styles.accionesDerecha}>
                {estadoRevisado === "pendiente" ? (
                  /* BOTONES ETAPA 1: VERIFICAR */
                  <>
                    <button
                      style={styles.iconBtnRechazar}
                      onClick={() => handleAccionDirecta("verificar_rechazar")}
                      title="Observar Aporte"
                    >
                      <TiDelete size={34} />
                    </button>
                    <button
                      style={styles.iconBtnAprobar}
                      onClick={() => handleAccionDirecta("verificar_aprobar")}
                      title="Verificar Aporte"
                    >
                      <FaRegCheckCircle size={24} />
                    </button>
                  </>
                ) : (
                  /* BOTONES ETAPA 2: AUDITAR / BANEAR */
                  <>
                    <button
                      style={{ ...styles.iconBtnRechazar, color: "#000" }}
                      onClick={() => handleAccionDirecta("banear")}
                      title="Banear Usuario"
                    >
                      <FaBan size={24} />
                    </button>
                    <button
                      style={styles.iconBtnRechazar}
                      onClick={() => handleAccionDirecta("auditar_rechazar")}
                      title="Rechazo Final"
                    >
                      <TiDelete size={34} />
                    </button>
                    <button
                      style={styles.iconBtnAuditar}
                      onClick={() => handleAccionDirecta("auditar_aprobar")}
                      title="Aprobación Final"
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

// 🟢 ESTILOS COMPLEMENTARIOS INTEGRADOS (Protegidos)
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
  plantaHeader: {
    padding: "12px 16px",
    backgroundColor: "#166534",
    color: "#fff",
  },
  plantaNombre: { fontSize: "1.2rem", fontWeight: "900", margin: 0 },
  plantaSubtitulo: { fontSize: "0.8rem", margin: "2px 0 0 0", opacity: 0.9 },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  alias: { fontSize: "0.85rem", fontWeight: "800", color: "#1e293b" },
  fecha: { fontSize: "0.75rem", color: "#94a3b8" },
  badge: {
    fontSize: "0.7rem",
    fontWeight: "900",
    padding: "3px 8px",
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "16px",
  },
  messageContent: { display: "flex", flexDirection: "column", flex: 1 },
  messageLabel: { fontSize: "0.8rem", fontWeight: "700", color: "#64748b" },
  messageText: {
    margin: "0",
    fontSize: "0.85rem",
    color: "#334155",
    fontStyle: "italic",
  },
  mediaContainer: {
    width: "100%",
    aspectRatio: "3 / 4",
    backgroundColor: "#1a1a1a",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
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
    zIndex: 2,
  },
  fichaCompacta: {
    width: "100%",
    padding: "20px 16px",
    backgroundColor: "#fff",
  },
  cuerpoFicha: { display: "flex", flexDirection: "column", gap: "12px" },
  itemFicha: { display: "flex", flexDirection: "column", gap: "2px" },
  valorFichaVerde: {
    fontSize: "1.3rem",
    fontWeight: "900",
    color: "#166534",
    margin: 0,
  },
  paisParentesis: { fontSize: "1rem", color: "#64748b", fontWeight: "600" },
  labelFicha: {
    fontSize: "0.65rem",
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
  },
  valorFichaGris: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#475569",
    margin: 0,
  },
  actionContainer: { padding: "12px 16px", backgroundColor: "#f8fafc" },
  inputComentario: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "0.85rem",
    resize: "none",
  },
  actionBar: { display: "flex", paddingTop: "8px" },
  accionesDerecha: {
    display: "flex",
    gap: "14px",
    marginLeft: "auto",
    alignItems: "center",
  },
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
