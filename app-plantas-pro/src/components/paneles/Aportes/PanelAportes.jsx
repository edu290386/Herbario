import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../supabaseClient";
import { TicketAporte } from "./TicketAporte";
import { logService } from "../../../services/logService";

export const PanelAportes = ({ user }) => {
  const [aportes, setAportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const userRole = user?.rol;

  const cargarAportes = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      let query = supabase
        .from("logs")
        .select(`*`)
        .in("tipo_accion", [
          "nueva_imagen",
          "nuevo_nombre",
          "nuevo_comentario",
        ]);

      if (userRole === "Usuario") {
        query = query.eq("usuario_id", user?.id);
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      setAportes(data || []);
    } catch (err) {
      console.error("Error técnico al cargar aportes:", err);
      setErrorMsg(
        err.message || "Ocurrió un error desconocido al cargar los datos.",
      );
    } finally {
      setLoading(false);
    }
  }, [userRole, user?.id]);

  // 🟢 RECARGA INVISIBLE: Carga al entrar y cada vez que la ventana recupera el foco
  useEffect(() => {
    cargarAportes();

    const onWindowFocus = () => {
      cargarAportes();
    };

    window.addEventListener("focus", onWindowFocus);

    return () => {
      window.removeEventListener("focus", onWindowFocus);
    };
  }, [cargarAportes]);

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

      setAportes((prev) =>
        prev.map((ticket) => {
          if (String(ticket.id) === String(logId)) {
            const esBaneo = accion === "banear";
            const esAuditoria = accion.startsWith("auditar_") || esBaneo;
            const esVerificacion = accion.startsWith("verificar_");

            let decision = accion.includes("aprobar")
              ? "aprobado"
              : "rechazado";
            if (esBaneo) decision = "baneado";

            let mensajes = {};
            try {
              mensajes =
                typeof ticket.mensaje_staff === "string"
                  ? JSON.parse(ticket.mensaje_staff)
                  : { ...ticket.mensaje_staff };
            } catch (e) {
              mensajes = { e };
            }

            const upd = { ...ticket };

            if (esAuditoria) {
              upd.auditado = decision;
              upd.auditado_por = aliasStaff;
              upd.fecha_auditado = new Date().toISOString();
              mensajes.auditado =
                comentario ||
                (esBaneo ? "Falta grave archivada." : "Aporte auditado.");
            } else if (esVerificacion) {
              upd.revisado = decision;
              upd.revisado_por = aliasStaff;
              upd.fecha_revision = new Date().toISOString();
              mensajes.revisado =
                comentario ||
                (decision === "aprobado"
                  ? "Aporte verificado."
                  : "Aporte observado.");
            }

            upd.mensaje_staff = mensajes;
            return upd;
          }
          return ticket;
        }),
      );
    } catch (error) {
      console.error("❌ Error al procesar:", error);
    }
  };

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
        padding: "16px",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
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

      {aportes.length === 0 && !loading && !errorMsg ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#94a3b8",
            backgroundColor: "#fff",
            borderRadius: "12px",
            border: "1px dashed #cbd5e1",
          }}
        >
          No hay aportes pendientes en este momento.
        </div>
      ) : (
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
