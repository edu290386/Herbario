import React from "react";
import { FaCheck, FaTimes, FaLeaf } from "react-icons/fa";

export const TicketAporte = ({ ticket, isStaff, onResolver }) => {
  // Supabase devuelve los JOINs como arrays, tomamos el primer (y único) aporte
  const cajaAporte = ticket.aportes?.[0]?.contenido || {};
  const esImagen = ticket.tipo_accion === "nueva_imagen";
  const esNombre = ticket.tipo_accion === "nuevo_nombre";

  return (
    <div style={styles.card}>
      {/* CABECERA DEL TICKET */}
      <div style={styles.header}>
        <div style={styles.infoPlanta}>
          <FaLeaf color="#2d8b57" />
          <strong style={{ fontSize: "1.1rem" }}>{ticket.nombre_planta}</strong>
        </div>
        <span style={styles.fecha}>
          {new Date(ticket.created_at).toLocaleDateString()}
        </span>
      </div>

      <div style={styles.autor}>
        Aporte de: <strong>@{ticket.alias}</strong>
      </div>

      {/* VISTA PREVIA (LA MAGIA VISUAL) */}
      <div style={styles.previewContainer}>
        <div style={styles.previewLabel}>Así se verá en la App:</div>

        {/* 1. PREVIEW DE IMAGEN (Simula el Carrusel 3:4) */}
        {esImagen && (
          <div style={styles.simuladorCarrusel}>
            <div style={styles.etiquetaCategoria}>
              {cajaAporte.categoria?.toUpperCase()}
            </div>
            <img
              src={cajaAporte.url}
              alt="Preview"
              style={styles.imagenPreview}
              loading="lazy"
            />
          </div>
        )}

        {/* 2. PREVIEW DE NOMBRE (Simula la Píldora Verde Internacional) */}
        {esNombre && (
          <div style={styles.simuladorNombres}>
            <div style={styles.pildoraNombre}>
              <span style={styles.bandera}>{cajaAporte.pais}</span>
              <span style={styles.textoNombre}>{cajaAporte.nombre}</span>
            </div>
          </div>
        )}
      </div>

      {/* ACCIONES DEL STAFF (Solo si está pendiente) */}
      {isStaff && ticket.revisado === "pendiente" ? (
        <div style={styles.accionesContainer}>
          <button
            onClick={() => onResolver(ticket, "rechazar")}
            style={styles.btnRechazar}
          >
            <FaTimes /> Rechazar
          </button>
          <button
            onClick={() => onResolver(ticket, "aprobar")}
            style={styles.btnAprobar}
          >
            <FaCheck /> Aprobar e Integrar
          </button>
        </div>
      ) : (
        <div style={styles.estadoFinal}>
          Estado:{" "}
          <strong
            style={{
              color: ticket.revisado === "aprobado" ? "#2d8b57" : "#ef4444",
            }}
          >
            {ticket.revisado.toUpperCase()}
          </strong>
        </div>
      )}
    </div>
  );
};

// --- ESTILOS RESPONSIVOS BLINDADOS ---
const styles = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: "8px",
  },
  infoPlanta: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#1e293b",
  },
  fecha: { fontSize: "0.85rem", color: "#94a3b8" },
  autor: { fontSize: "0.9rem", color: "#64748b" },

  // Contenedor principal de la simulación
  previewContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    padding: "12px",
    border: "1px dashed #cbd5e1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  previewLabel: {
    fontSize: "0.8rem",
    color: "#64748b",
    fontWeight: "bold",
    alignSelf: "flex-start",
  },

  // Simulador de Imagen (Mantiene proporción 3:4)
  simuladorCarrusel: {
    position: "relative",
    width: "100%",
    maxWidth: "250px", // En desktop no crece infinitamente
    aspectRatio: "3 / 4",
    backgroundColor: "#e2e8f0",
    borderRadius: "8px",
    overflow: "hidden",
  },
  imagenPreview: { width: "100%", height: "100%", objectFit: "cover" },
  etiquetaCategoria: {
    position: "absolute",
    top: "8px",
    left: "8px",
    backgroundColor: "rgba(45, 139, 87, 0.9)", // Verde frondoso
    color: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "bold",
    zIndex: 2,
  },

  // Simulador de Nombres (Píldora Verde)
  simuladorNombres: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "10px 0",
  },
  pildoraNombre: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#e6f4ea", // Fondo verde clarito
    border: "1px solid #2d8b57",
    borderRadius: "20px",
    padding: "6px 14px",
    gap: "8px",
  },
  bandera: { fontSize: "1.2rem", fontWeight: "bold", color: "#2d8b57" },
  textoNombre: { fontSize: "1rem", color: "#1e293b", fontWeight: "500" },

  // Botones
  accionesContainer: { display: "flex", gap: "10px", marginTop: "8px" },
  btnRechazar: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#fee2e2",
    color: "#ef4444",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    cursor: "pointer",
  },
  btnAprobar: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2d8b57",
    color: "white",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    cursor: "pointer",
  },
  estadoFinal: {
    textAlign: "right",
    fontSize: "0.9rem",
    color: "#64748b",
    marginTop: "8px",
  },
};
