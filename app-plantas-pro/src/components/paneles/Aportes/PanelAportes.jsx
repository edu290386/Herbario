import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import { TicketAporte } from "./TicketAporte";
import { logService } from "../../../services/logService";

export const PanelAportes = ({ user }) => {
  const [aportes, setAportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null); // 🟢 Estado para capturar errores de carga

  const userRole = user?.rol;

  // 1. Usamos useCallback para estabilizar la función y evitar re-renders innecesarios
  const cargarAportes = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null); // Limpiamos errores previos al reintentar

    try {
      let query = supabase
        .from("logs")
        .select(`*`) 
        .in("tipo_accion", [
          "nueva_imagen",
          "nuevo_nombre",
          "nuevo_comentario",
        ]);

      // Seguridad: Si es Usuario normal, solo ve los suyos
      if (userRole === "Usuario") {
        query = query.eq("usuario_id", user?.id);
      } else {
        // Staff y Admin ven todo. Ordenamos para que lo más nuevo salga primero
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error; // Lanzamos el error para que caiga en el catch

      setAportes(data || []);
    } catch (err) {
      console.error("Error técnico al cargar aportes:", err);
      // 🟢 Guardamos el mensaje exacto que devuelve la base de datos
      setErrorMsg(
        err.message || "Ocurrió un error desconocido al cargar los datos.",
      );
    } finally {
      setLoading(false);
    }
  }, [userRole, user?.id]); // 🟢 Dependencias correctas de las que depende la función

  // 2. useEffect ahora puede depender de forma segura de cargarAportes
  useEffect(() => {
    cargarAportes();
  }, [cargarAportes]);

  // La función que recibe la decisión desde el TicketAporte
  const procesarDecision = async (idParam, accion, comentario) => {
    try {
      const logId = typeof idParam === "object" ? idParam.id : idParam;
      const ticketTarget = aportes.find((t) => String(t.id) === String(logId));
      if (!ticketTarget) return;

      const aliasStaff = user?.alias || "Staff";

      await logService.resolverAporte({
        logId: logId,
        plantaId: ticketTarget.planta_id,
        accion: accion,
        tipoAporte: ticketTarget.tipo_accion,
        contenidoJSON: ticketTarget.contenido || {},
        revisorAlias: aliasStaff,
        comentario: comentario,
      });

      // ACTUALIZACIÓN VISUAL INMEDIATA EN REACT
      setAportes((aportesAnteriores) =>
        aportesAnteriores.map((ticket) => {
          if (String(ticket.id) === String(logId)) {
            const esAuditoria = accion.startsWith("auditar_");
            const decision = accion.includes("aprobar")
              ? "aprobado"
              : "rechazado";

            // Parseo seguro
            let mensajesActuales = {};
            if (typeof ticket.mensaje_staff === "string") {
              try {
                mensajesActuales = JSON.parse(ticket.mensaje_staff);
              } catch (e) {e}
            } else if (ticket.mensaje_staff) {
              mensajesActuales = { ...ticket.mensaje_staff };
            }

            const ticketActualizado = {
              ...ticket,
              mensaje_staff: mensajesActuales,
            };

            if (esAuditoria) {
              ticketActualizado.auditado = decision; // Escribe el texto
              ticketActualizado.auditado_por = aliasStaff;
              ticketActualizado.fecha_auditado = new Date().toISOString();
              ticketActualizado.mensaje_staff.auditado =
                comentario ||
                (decision === "aprobado"
                  ? "Validación oficial completada."
                  : "Aporte vetado en auditoría.");
            } else {
              ticketActualizado.revisado = decision; // Escribe el texto
              ticketActualizado.revisado_por = aliasStaff;
              ticketActualizado.fecha_revision = new Date().toISOString();
              ticketActualizado.mensaje_staff.revisado =
                comentario ||
                (decision === "aprobado"
                  ? "Aporte verificado."
                  : "Aporte rechazado.");
            }

            return ticketActualizado;
          }
          return ticket;
        }),
      );
    } catch (error) {
      console.error("❌ Error al procesar:", error);
    }
  };

  // Pantalla inicial de carga
  if (loading && aportes.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
        Iniciando estación de trabajo...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* 🟢 Banner visual de error para ayudar en el diagnóstico de carga */}
      {errorMsg && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            border: "1px solid #ef4444",
            color: "#991b1b",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          <strong>Error de conexión:</strong> {errorMsg}
        </div>
      )}

      {/* Mensaje de estado vacío */}
      {aportes.length === 0 && !loading && !errorMsg ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          No hay aportes pendientes en este momento.
        </div>
      ) : (
        // Renderizado de Tickets
        aportes
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .map((ticket) => (
            <TicketAporte
              key={ticket.id}
              ticket={ticket}
              userRole={userRole}
              onProcesar={(id, accion, com) =>
                procesarDecision(ticket, accion, com)
              }
            />
          ))
      )}
    </div>
  );
};
