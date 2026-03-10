import React, { useState, useEffect, useCallback } from "react";
import { logService } from "../../services/logService";
import { RegistroLog } from "./Actividades/RegistroLog";
import { TicketAporte } from "./Aportes/TicketAporte"; // Ajusta la ruta si es necesario

export const PanelLogs = ({ tipo, user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const esStaff = user?.rol === "Administrador" || user?.rol === "Colaborador";

  const fetchLogs = useCallback(async () => {
    if (!tipo || !user) return;
    setLoading(true);
    try {
      // Usamos el servicio centralizado
      const data = await logService.getLogs(tipo, user);
      setLogs(data);
    } catch (err) {
      console.error("Error cargando logs:", err);
    } finally {
      setLoading(false);
    }
  }, [tipo, user]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Función temporal vacía para cuando implementemos la lógica de aprobar/rechazar
  const handleResolver = (ticket, accion) => {
    console.log(`Acción: ${accion} en el ticket:`, ticket.id);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
        Sincronizando bitácora...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
        Sin registros recientes.
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "#f8fafc",
        height: "100%",
        overflowY: "auto",
      }}
    >
      {logs.map((log) =>
        tipo === "gestion" ? (
          <TicketAporte
            key={log.id}
            ticket={log}
            isStaff={esStaff}
            onResolver={handleResolver}
          />
        ) : (
          <RegistroLog key={log.id} log={log} userRole={user?.rol} />
        ),
      )}
    </div>
  );
};
