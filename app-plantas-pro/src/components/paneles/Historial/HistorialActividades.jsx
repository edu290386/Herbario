import { useState, useEffect } from "react";
import { getLogs } from "../../../services/plantasServices";
import { RegistroLog } from "../RegistroLog";

export const HistorialActividades = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      // Validamos que el usuario tenga grupo antes de consultar
      if (!user?.grupo_id) return;

      setLoading(true);
      try {
        // Pasamos "actividades" y el objeto user completo
        const { data, error } = await getLogs("actividades", user);
        if (!error) setLogs(data || []);
      } catch (err) {
        console.error("Error cargando el historial:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [user]);

  if (!user?.grupo_id) {
    return (
      <p className="empty-text">
        Debes pertenecer a un grupo para ver la actividad.
      </p>
    );
  }

  if (loading)
    return <p className="loading-text">Cargando actividad del grupo...</p>;

  if (logs.length === 0) {
    return (
      <p className="empty-text">
        Tu grupo no tiene actividad en los últimos 30 días.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "10px 0",
      }}
    >
      {logs.map((log) => (
        <RegistroLog
          key={log.id}
          log={log}
          userRole={user?.rol}
          panelType="actividades"
          // Omitimos onAction y onReview porque aquí NO se puede editar nada
        />
      ))}
    </div>
  );
};
